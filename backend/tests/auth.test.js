import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

// Mockeamos el repositorio de usuarios para no necesitar base de datos real
vi.mock('../src/repositories/usuarioRepository.js', () => ({
    findByEmail: vi.fn(),
    findByNombreUsuario: vi.fn(),
    createUsuario: vi.fn(),
    findById: vi.fn(),
    updateUsuario: vi.fn(),
}));

// Mockeamos bcrypt para controlar el resultado en tests
vi.mock('../src/utils/bcrypt.js', () => ({
    hashPassword: vi.fn(async (p) => `hashed_${p}`),
    comparePassword: vi.fn(),
}));

import { findByEmail, findByNombreUsuario, createUsuario } from '../src/repositories/usuarioRepository.js';
import { comparePassword } from '../src/utils/bcrypt.js';

describe('POST /api/auth/register', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 400 when email is invalid', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'not-an-email', password: 'Password1@', nombre_usuario: 'testuser' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid email address');
    });

    it('returns 400 when email is already registered', async () => {
        findByEmail.mockResolvedValue({ id: 1, email: 'taken@test.com' });
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'taken@test.com', password: 'Password1@', nombre_usuario: 'newuser' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email already registered');
    });

    it('returns 400 when username is already taken', async () => {
        findByEmail.mockResolvedValue(null);
        findByNombreUsuario.mockResolvedValue({ id: 2, nombre_usuario: 'takenuser' });
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'new@test.com', password: 'Password1@', nombre_usuario: 'takenuser' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Username already taken');
    });

    it('returns 400 when password does not meet requirements', async () => {
        findByEmail.mockResolvedValue(null);
        findByNombreUsuario.mockResolvedValue(null);
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'new@test.com', password: 'weak', nombre_usuario: 'validuser' });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid password');
    });

    it('registers successfully and returns user + token', async () => {
        findByEmail.mockResolvedValue(null);
        findByNombreUsuario.mockResolvedValue(null);
        createUsuario.mockResolvedValue({
            id: 99,
            nombre_usuario: 'validuser',
            email: 'new@test.com',
            ciudad: 'Madrid',
            provincia: 'Madrid',
        });
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'new@test.com', password: 'Password1@', nombre_usuario: 'validuser' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.usuario.email).toBe('new@test.com');
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 400 when user does not exist', async () => {
        findByEmail.mockResolvedValue(null);
        findByNombreUsuario.mockResolvedValue(null);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@test.com', password: 'Password1@' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid credentials');
    });

    it('returns 400 when password is incorrect', async () => {
        findByEmail.mockResolvedValue({ id: 1, email: 'user@test.com', password: 'hashed_Password1@' });
        comparePassword.mockResolvedValue(false);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@test.com', password: 'WrongPass1@' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid credentials');
    });

    it('returns user and token on successful login', async () => {
        findByEmail.mockResolvedValue({
            id: 1,
            nombre_usuario: 'testuser',
            email: 'user@test.com',
            password: 'hashed_Password1@',
            ciudad: 'Madrid',
            provincia: 'Madrid',
        });
        comparePassword.mockResolvedValue(true);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@test.com', password: 'Password1@' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.usuario.nombre_usuario).toBe('testuser');
    });
});
