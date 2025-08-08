import { app } from '../setup';
import { createHttpRequest } from '@midwayjs/mock';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { User } from '../../src/entity/user.entity';
import { Activity } from '../../src/entity/activity.entity';
import { Comment } from '../../src/entity/comment.entity';
import * as bcrypt from 'bcryptjs';

describe('CommentController', () => {
  /* ---------- 通用工具 ---------- */
  const createUser = async (payload: Partial<User>) => {
    const container = app.getApplicationContext();
    const dsMgr = await container.getAsync(TypeORMDataSourceManager);
    const ds = dsMgr.getDataSource('default');
    const userRepo = ds.getRepository(User);
    return userRepo.save({
      ...payload,
      password: await bcrypt.hash('123456', 10),
    });
  };

  const login = async (email: string) => {
    const res = await createHttpRequest(app)
      .post('/api/auth/login')
      .send({ email, password: '123456' });
    return res.body.token;
  };

  /* ---------- 全局变量 ---------- */
  let adminToken: string;
  let userAToken: string;
  let userBToken: string;
  let activity: Activity;

  /* ---------- 全局前置 ---------- */
  beforeAll(async () => {
    // 清空数据库并重新同步
    const container = app.getApplicationContext();
    const dsMgr = await container.getAsync(TypeORMDataSourceManager);
    const ds = dsMgr.getDataSource('default');
    await ds.synchronize(true);

    // 创建 3 个用户：admin、userA、userB
    await createUser({ email: 'admin@test.com', name: 'Admin', role: 'admin' });
    await createUser({ email: 'userA@test.com', name: 'UserA', role: 'user' });
    await createUser({ email: 'userB@test.com', name: 'UserB', role: 'user' });

    adminToken = await login('admin@test.com');
    userAToken = await login('userA@test.com');
    userBToken = await login('userB@test.com');

    // 管理员创建一个活动
    const res = await createHttpRequest(app)
      .post('/api/admin/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '羽毛球',
        description: '周末约球',
        capacity: 10,
        startAt: new Date('2024-08-10T09:00:00Z'),
        endAt: new Date('2024-08-10T12:00:00Z'),
      });
    activity = res.body;
  });

  /* ---------- 测试用例 ---------- */

  it('should create a root comment', async () => {
    const res = await createHttpRequest(app)
      .post(`/api/activities/${activity.id}/comments`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ content: '我来参加！' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.content).toBe('我来参加！');
    expect(res.body.parentId).toBeNull();
  });

  it('should create a child comment (楼中楼)', async () => {
    // 先拿到刚才的一级评论 id
    const list = await createHttpRequest(app)
      .get(`/api/activities/${activity.id}/comments`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    const parentId = list.body.data[0].id;

    const res = await createHttpRequest(app)
      .post(`/api/activities/${activity.id}/comments`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ content: '带我一个', parentId })
      .expect(201);

    expect(res.body.parentId).toBe(parentId);
  });

  it('should list comments with children', async () => {
    const res = await createHttpRequest(app)
      .get(`/api/activities/${activity.id}/comments`)
      .set('Authorization', `Bearer ${userAToken}`)
      .query({ page: 1, size: 10 })
      .expect(200);

    expect(res.body.data).toHaveLength(1); // 一级评论只有 1 条
    expect(res.body.data[0].children).toHaveLength(1); // 楼中楼 1 条
    expect(res.body.data[0].children[0].content).toBe('带我一个');
  });

  it('should delete own comment', async () => {
    // userA 创建一条评论
    const createRes = await createHttpRequest(app)
      .post(`/api/activities/${activity.id}/comments`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ content: '临时有事不去了' })
      .expect(201);
    const id = createRes.body.id;

    // userA 自己删除
    await createHttpRequest(app)
      .delete(`/api/activities/${activity.id}/comments/${id}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    // 再次查询不应存在
    const listRes = await createHttpRequest(app)
      .get(`/api/activities/${activity.id}/comments`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);
    const exists = listRes.body.data.some((c: Comment) => c.id === id);
    expect(exists).toBe(false);
  });

  it('should allow admin to delete any comment', async () => {
    // userB 创建
    const createRes = await createHttpRequest(app)
      .post(`/api/activities/${activity.id}/comments`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ content: '广告' })
      .expect(201);
    const id = createRes.body.id;

    // admin 删除
    await createHttpRequest(app)
      .delete(`/api/activities/${activity.id}/comments/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should return 404 when deleting non-existent comment', async () => {
    await createHttpRequest(app)
      .delete(`/api/activities/${activity.id}/comments/9999`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('should return 404 when user tries to delete others comment', async () => {
    // userA 创建
    const createRes = await createHttpRequest(app)
      .post(`/api/activities/${activity.id}/comments`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ content: 'userA 的评论' })
      .expect(201);
    const id = createRes.body.id;

    // userB 无权删除
    await createHttpRequest(app)
      .delete(`/api/activities/${activity.id}/comments/${id}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .expect(404);
  });

  it('should return 400 when activityId is invalid', async () => {
    await createHttpRequest(app)
      .post(`/api/activities/abc/comments`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ content: 'test' })
      .expect(400);
  });
});
