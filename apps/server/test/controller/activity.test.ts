import { app } from '../setup';
import { createHttpRequest } from '@midwayjs/mock';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { User } from '../../src/entity/user.entity';
import { Activity } from '../../src/entity/activity.entity';
import * as bcrypt from 'bcryptjs';

describe('GET /api/activities', () => {
  /* ------------------- 工具函数 ------------------- */
  // 登录并缓存 token
  let adminToken: string;

  // 用管理员身份创建活动
  const createActivity = (payload: Partial<Activity>) =>
    createHttpRequest(app)
      .post('/api/admin/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

  /* ------------------- 全局前置 ------------------- */
  beforeAll(async () => {
    // 1. 拿到数据源
    const container = app.getApplicationContext();
    const dsMgr = await container.getAsync(TypeORMDataSourceManager);
    const ds = dsMgr.getDataSource('default');

    await ds.synchronize(true);

    // 2. 事务：插入管理员（若不存在）
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

    // 3. 登录拿 token
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
    // 造 2 条数据
    await Promise.all([
      createActivity({ title: '篮球', description: 'ball', capacity: 10 }),
      createActivity({ title: '羽毛球', description: 'bat', capacity: 8 }),
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
