import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

const email = `test-${Date.now()}@example.com`;
let accessToken;

describe('auth API', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('registers a user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: '测试用户', email, password: '123456' });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    accessToken = response.body.data.accessToken;
  });

  it('rejects duplicate email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: '重复用户', email, password: '123456' });

    expect(response.status).toBe(409);
  });

  it('rejects incorrect credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrong-password' });

    expect(response.status).toBe(401);
  });

  it('logs in and returns a token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: '123456' });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    accessToken = response.body.data.accessToken;
  });

  it('rejects /me without a token', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
  });

  it('returns the current user with a valid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(email);
  });
});
