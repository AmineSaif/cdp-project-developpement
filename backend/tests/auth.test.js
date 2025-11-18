const request = require('supertest');
const app = require('./testUtils/app');
beforeAll(async () => {
  const tu = require('./testUtils/app');
  await tu.ensureDb();
});

describe('Auth API', () => {
  const user = { name: 'Test User', email: `test+${Date.now()}@example.com`, password: 'password123' };

  test('Register new user', async () => {
    const tu = require('./testUtils/app');
    await tu.ensureDb();
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(user.email);
  });

  test('Login with credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
