import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testUser = {
    name: 'Test User',
    email: 'jesttest@example.com',
    password: 'password123'
};

beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
});

afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
});

describe('POST /auth/register', () => {
    it('creates a new user and returns a token', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send(testUser);

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.role).toBe('user');
    });

    it('rejects a duplicate email', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send(testUser);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email already in use');
    });
});

describe('POST /auth/login', () => {
    it('logs in with correct credentials', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('rejects an incorrect password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: testUser.email, password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid email or password');
    });
});