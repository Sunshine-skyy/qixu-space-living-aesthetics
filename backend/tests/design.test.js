import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

const email = `design-${Date.now()}@example.com`;
let token;
let designId;

describe('designs API', () => {
  beforeAll(async () => {
    const response = await request(app).post('/api/v1/auth/register').send({ username: 'Design Tester', email, password: '123456' });
    token = response.body.data.accessToken;
  });

  it('requires authentication', async () => {
    expect((await request(app).get('/api/v1/designs')).status).toBe(401);
  });

  it('creates and lists a design', async () => {
    const created = await request(app).post('/api/v1/designs').set('Authorization', `Bearer ${token}`).send({ name: 'Living room', data: { elements: [], room: { width: 960 } } });
    expect(created.status).toBe(201);
    designId = created.body.data.id;
    const listed = await request(app).get('/api/v1/designs').set('Authorization', `Bearer ${token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.data.some(item => item.id === designId)).toBe(true);
  });

  it('updates and deletes a design', async () => {
    const updated = await request(app).patch(`/api/v1/designs/${designId}`).set('Authorization', `Bearer ${token}`).send({ name: 'Updated room' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe('Updated room');
    expect((await request(app).delete(`/api/v1/designs/${designId}`).set('Authorization', `Bearer ${token}`)).status).toBe(204);
    expect((await request(app).get(`/api/v1/designs/${designId}`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
  });

  it('rejects invalid design data', async () => {
    const response = await request(app).post('/api/v1/designs').set('Authorization', `Bearer ${token}`).send({ name: '', data: [] });
    expect(response.status).toBe(400);
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
});
