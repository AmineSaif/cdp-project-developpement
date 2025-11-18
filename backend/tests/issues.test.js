const request = require('supertest');
const app = require('./testUtils/app');

describe('Issues API', () => {
  let token;

  beforeAll(async () => {
    // ensure clean DB, then register and login
    const tu = require('./testUtils/app');
    await tu.ensureDb();
  const email = `i+${Date.now()}@example.com`;
  await request(app).post('/api/auth/register').send({ name: 'User', email, password: 'password' });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password' });
    token = res.body.token;
  });

  test('Create issue (protected)', async () => {
    // ensure DB clean before creating
    const tu = require('./testUtils/app');
    await tu.ensureDb();
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'First issue', description: 'desc' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('First issue');
  });

  test('List issues', async () => {
    const res = await request(app).get('/api/issues');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
