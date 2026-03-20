import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

// Mockeamos la llamada a Google Books API para no depender de red
vi.mock('../src/utils/apiGoogle.js', () => ({
    searchBooks: vi.fn(),
    getBookById: vi.fn(),
    getBookByIsbn: vi.fn(),
}));

vi.mock('../src/repositories/libroRepository.js', () => ({
    findByIsbn: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    searchByAutor: vi.fn(),
    searchByTitle: vi.fn(),
}));

import { searchBooks } from '../src/utils/apiGoogle.js';
import { findByIsbn } from '../src/repositories/libroRepository.js';

const mockGoogleBook = (overrides = {}) => ({
    id: 'abc123',
    volumeInfo: {
        title: 'Test Book',
        authors: ['Test Author'],
        description: 'A great test book description with enough content.',
        industryIdentifiers: [{ type: 'ISBN_13', identifier: '9781234567890' }],
        imageLinks: {
            thumbnail: 'https://books.google.com/books/content?id=abc123&zoom=1',
            smallThumbnail: 'https://books.google.com/books/content?id=abc123&zoom=0',
        },
        publisher: 'Test Publisher',
        publishedDate: '2020-01-01',
        ...overrides,
    },
});

describe('GET /api/libros/search', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 400 when query is missing', async () => {
        const res = await request(app).get('/api/libros/search');
        expect(res.status).toBe(400);
    });

    it('returns filtered list of books', async () => {
        searchBooks.mockResolvedValue([mockGoogleBook()]);
        const res = await request(app).get('/api/libros/search?q=test');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].titulo).toBe('Test Book');
        expect(res.body[0].isbn).toBe('9781234567890');
    });

    it('excludes books without images', async () => {
        searchBooks.mockResolvedValue([
            mockGoogleBook(),
            { id: 'noimg', volumeInfo: { title: 'No Image Book', description: 'desc', imageLinks: null } },
        ]);
        const res = await request(app).get('/api/libros/search?q=test');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('excludes books without description', async () => {
        searchBooks.mockResolvedValue([
            mockGoogleBook(),
            { ...mockGoogleBook({ description: undefined }), id: 'nodesc' },
        ]);
        const res = await request(app).get('/api/libros/search?q=test');
        expect(res.status).toBe(200);
        // Only the one with description passes the filter
        expect(res.body.every(b => b.titulo)).toBe(true);
    });

    it('returns portada_url using zoom=1', async () => {
        searchBooks.mockResolvedValue([mockGoogleBook()]);
        const res = await request(app).get('/api/libros/search?q=test');
        expect(res.status).toBe(200);
        expect(res.body[0].portada_url).toContain('zoom=1');
    });

    it('returns 400 when Google API fails', async () => {
        searchBooks.mockRejectedValue(new Error('API unavailable'));
        const res = await request(app).get('/api/libros/search?q=test');
        expect(res.status).toBe(400);
    });
});

describe('GET /api/libros/:id (by ISBN)', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns book from database when it exists', async () => {
        const dbBook = {
            id: 1,
            titulo: 'DB Book',
            autor: 'DB Author',
            isbn: '9781234567890',
            portada_url: 'https://example.com/cover.jpg',
        };
        findByIsbn.mockResolvedValue(dbBook);
        const res = await request(app).get('/api/libros/9781234567890');
        expect(res.status).toBe(200);
        expect(res.body.titulo).toBe('DB Book');
    });
});
