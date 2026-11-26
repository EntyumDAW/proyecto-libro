import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mockeamos Prisma para no necesitar una base de datos real
vi.mock('../src/config/db.js', () => ({
    default: { $queryRaw: vi.fn() },
}));

import prisma from '../src/config/db.js';
import app from '../src/server.js';

describe('GET /health', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 200 with status ok when the database responds', async () => {
        prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.db).toBe('ok');
    });

    it('returns 503 when the database is down', async () => {
        prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
        const res = await request(app).get('/health');
        expect(res.status).toBe(503);
        expect(res.body.db).toBe('down');
    });
});
