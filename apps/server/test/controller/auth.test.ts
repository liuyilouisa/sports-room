import { createHttpRequest } from '@midwayjs/mock';
import { app } from '../setup';

describe('AuthController (e2e)', () => {
  const registerPayload = {
    name: 'alice',
    password: '123456',
    email: 'alice@example.com',
  };

  it('POST /api/auth/register 201', async () => {
    const res = await createHttpRequest(app)
      .post('/api/auth/register')
      .send(registerPayload)
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      name: 'alice',
      email: 'alice@example.com',
    });
    expect(res.headers.location).toMatch(/\/api\/users\/\d+$/);
  });

  it('POST /api/auth/register 409 邮箱已存在', async () => {
    // 第一次注册
    await createHttpRequest(app)
      .post('/api/auth/register')
      .send(registerPayload);

    // 重复注册
    const res = await createHttpRequest(app)
      .post('/api/auth/register')
      .send({ ...registerPayload, name: 'bob' }) // 仅名字不同
      .expect(409);

    expect(res.body.message).toBe('邮箱已存在');
  });

  it('POST /api/auth/login 200 + /me', async () => {
    await createHttpRequest(app)
      .post('/api/auth/register')
      .send({
        name: 'bob',
        password: '123456',
        email: 'bob@example.com',
      });

    const loginRes = await createHttpRequest(app).post('/api/auth/login').send({
      email: 'bob@example.com',
      password: '123456',
    });

    const { token } = loginRes.body;
    expect(token).toBeDefined();

    // 携带 token 访问 /me
    const meRes = await createHttpRequest(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meRes.body).toMatchObject({
      id: expect.any(Number),
      name: 'bob',
      email: 'bob@example.com',
    });
  });

  it('POST /api/auth/login 401 密码错误', async () => {
    await createHttpRequest(app).post('/api/auth/register').send({
      name: 'carol',
      password: '123456',
      email: 'carol@example.com',
    });

    const res = await createHttpRequest(app)
      .post('/api/auth/login')
      .send({
        email: 'carol@example.com',
        password: 'wrong',
      })
      .expect(401);

    expect(res.body.message).toBe('邮箱或密码错误');
  });

  it('GET /api/auth/me 401 未携带 token', async () => {
    await createHttpRequest(app).get('/api/auth/me').expect(401);
  });
});
