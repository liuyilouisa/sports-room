import { app } from '../setup';
import { createHttpRequest } from '@midwayjs/mock';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { User } from '../../src/entity/user.entity';
import { Activity } from '../../src/entity/activity.entity';
import * as bcrypt from 'bcryptjs';

describe('GET /api/activities', () => {
  /* ------------------- 工具函数 ------------------- */
  let adminToken: string;

  // 管理员创建活动（必须带 startAt）
  const createActivity = (payload: Partial<Activity>) =>
    createHttpRequest(app)
      .post('/api/admin/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

  /* ------------------- 全局前置 ------------------- */
  beforeAll(async () => {
    const container = app.getApplicationContext();
    const dsMgr = await container.getAsync(TypeORMDataSourceManager);
    const ds = dsMgr.getDataSource('default');
    await ds.synchronize(true);

    await ds.transaction(async em => {
      const userRepo = em.getRepository(User);
      if ((await userRepo.count()) === 0) {
        await userRepo.save({
          email: 'admin@test.com',
          password: await bcrypt.hash('123456', 10),
          name: 'Admin',
          role: 'admin',
        });
      }
    });

    const res = await createHttpRequest(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: '123456' });
    adminToken = res.body.token;
  });

  /* ------------------- 用例 ------------------- */
  it('should return empty array when no activity', async () => {
    const res = await createHttpRequest(app)
      .get('/api/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('should return paginated list', async () => {
    await Promise.all([
      createActivity({
        title: '篮球',
        description: 'ball',
        capacity: 10,
        startAt: new Date('2024-08-10T15:00:00Z'), // ← Date
        endAt: new Date('2024-08-10T17:00:00Z'), // ← Date
      }),
      createActivity({
        title: '羽毛球',
        description: 'bat',
        capacity: 8,
        startAt: new Date('2024-08-11T09:00:00Z'), // ← Date
      }),
    ]);

    const res = await createHttpRequest(app)
      .get('/api/activities?page=1&size=1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.size).toBe(1);
  });

  it('should filter by keyword (case-insensitive)', async () => {
    const res = await createHttpRequest(app)
      .get('/api/activities')
      .query({ keyword: '羽毛' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('羽毛球');
  });
});
