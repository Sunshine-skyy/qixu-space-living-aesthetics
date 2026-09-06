import 'dotenv/config';
import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

describe('products API', () => {
  it('lists products with pagination', async () => {
    const response = await request(app).get('/api/v1/products?page=1&pageSize=2');
    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(2);
  });

  it('filters products by category and price', async () => {
    const response = await request(app).get('/api/v1/products?category=sofa&maxPrice=4000');
    expect(response.status).toBe(200);
    expect(response.body.data.items.every((item) => item.category === 'sofa' && item.price <= 4000)).toBe(true);
  });

  it('returns a product detail', async () => {
    const response = await request(app).get('/api/v1/products/1');
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(1);
  });

  it('returns 404 for an unknown product', async () => {
    const response = await request(app).get('/api/v1/products/999999');
    expect(response.status).toBe(404);
  });
});

afterAll(async () => prisma.$disconnect());
