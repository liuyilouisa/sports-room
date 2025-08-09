import { app } from '../setup';
import { createHttpRequest } from '@midwayjs/mock';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { User } from '../../src/entity/user.entity';
import { Activity } from '../../src/entity/activity.entity';
import { Order } from '../../src/entity/order.entity';
import * as bcrypt from 'bcryptjs';
import * as dayjs from 'dayjs';

describe('OrderController (e2e)', () => {
  /* ---------- 通用工具 ---------- */
  const createUser = async (payload: Partial<User>) => {
    const ds = await getDS();
    const userRepo = ds.getRepository(User);
    return userRepo.save({
      ...payload,
      password: await bcrypt.hash('123456', 10),
    });
  };

  const login = (email: string) =>
    createHttpRequest(app)
      .post('/api/auth/login')
      .send({ email, password: '123456' })
      .then(r => r.body.token);

  const getDS = async () => {
    const container = app.getApplicationContext();
    const dsMgr = await container.getAsync(TypeORMDataSourceManager);
    return dsMgr.getDataSource('default');
  };

  /* ---------- 全局变量 ---------- */
  let user: User;
  let token: string;
  let publishedAct: Activity;
  let fullAct: Activity;
  let endedAct: Activity;

  /* ---------- 全局前置 ---------- */
  beforeAll(async () => {
    const ds = await getDS();
    await ds.synchronize(true); // 重新建表

    user = await createUser({
      name: 'Alice',
      email: 'alice@test.com',
      points: 200,
    });
    token = await login('alice@test.com');

    const actRepo = ds.getRepository(Activity);

    // 正常可报名活动
    publishedAct = await actRepo.save({
      title: '羽毛球',
      description: '周末约球',
      capacity: 2,
      enrolledCount: 0,
      status: 'published',
      startAt: dayjs().add(1, 'day').toDate(),
      endAt: dayjs().add(1, 'day').add(2, 'hour').toDate(),
    });

    // 已满活动
    fullAct = await actRepo.save({
      title: 'Full',
      description: '已满活动',
      capacity: 1,
      enrolledCount: 1,
      status: 'published',
      startAt: dayjs().add(1, 'day').toDate(),
      endAt: dayjs().add(1, 'day').add(2, 'hour').toDate(),
    });

    // 已结束活动
    endedAct = await actRepo.save({
      title: 'Ended',
      description: '已结束活动',
      capacity: 10,
      enrolledCount: 0,
      status: 'published',
      startAt: dayjs().subtract(2, 'day').toDate(),
      endAt: dayjs().subtract(1, 'day').toDate(),
    });
  });

  /* ======================================================
     创建订单
  ====================================================== */
  describe('POST /api/orders', () => {
    it('201 报名成功', async () => {
      const res = await createHttpRequest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ activityId: publishedAct.id })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.secret).toHaveLength(8);
      expect(res.body.costPoints).toBe(100);

      // 积分已扣减
      const ds = await getDS();
      const u = await ds.getRepository(User).findOneBy({ id: user.id });
      expect(u!.points).toBe(100);

      // 名额已加
      const act = await ds
        .getRepository(Activity)
        .findOneBy({ id: publishedAct.id });
      expect(act!.enrolledCount).toBe(1);
    });

    it('409 活动未发布', async () => {
      const ds = await getDS();
      const draft = await ds.getRepository(Activity).save({
        title: 'draft',
        description: '未发布活动',
        status: 'draft',
        capacity: 10,
        startAt: dayjs().add(1, 'day').toDate(),
        endAt: dayjs().add(1, 'day').add(2, 'hour').toDate(),
      });

      const res = await createHttpRequest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ activityId: draft.id })
        .expect(409);

      expect(res.body.message).toBe('活动未发布');
    });

    it('409 活动已结束', async () => {
      const res = await createHttpRequest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ activityId: endedAct.id })
        .expect(409);

      expect(res.body.message).toBe('活动已结束');
    });

    it('409 名额已满', async () => {
      const res = await createHttpRequest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ activityId: fullAct.id })
        .expect(409);

      expect(res.body.message).toBe('名额已满');
    });

    it('409 积分不足', async () => {
      await createUser({
        name: 'Poor',
        email: 'poor@test.com',
        points: 50,
      });
      const poorToken = await login('poor@test.com');

      const res = await createHttpRequest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${poorToken}`)
        .send({ activityId: publishedAct.id })
        .expect(409);

      expect(res.body.message).toBe('积分不足');
    });

    it('401 未登录', async () => {
      await createHttpRequest(app)
        .post('/api/orders')
        .send({ activityId: publishedAct.id })
        .expect(401);
    });

    // it('409 并发冲突（乐观锁）', async () => {
    //   // 两个并发请求同时报名最后一个名额
    //   await createUser({
    //     name: 'Bob',
    //     email: 'bob@test.com',
    //     points: 200,
    //   });
    //   const otherToken = await login('bob@test.com');

    //   // 先把名额改成只剩 1
    //   const ds = await getDS();
    //   await ds
    //     .getRepository(Activity)
    //     .update({ id: publishedAct.id }, { enrolledCount: 1, capacity: 2 });

    //   const p1 = createHttpRequest(app)
    //     .post('/api/orders')
    //     .set('Authorization', `Bearer ${token}`)
    //     .send({ activityId: publishedAct.id });

    //   const p2 = createHttpRequest(app)
    //     .post('/api/orders')
    //     .set('Authorization', `Bearer ${otherToken}`)
    //     .send({ activityId: publishedAct.id });

    //   const [res1, res2] = await Promise.all([p1, p2]);

    //   // 一个成功 201，一个失败 409
    //   const codes = [res1.status, res2.status].sort();
    //   expect(codes).toEqual([201, 409]);
    //   const failed = [res1, res2].find(r => r.status === 409);
    //   expect(failed!.body.message).toBe('名额已被抢光，请稍后再试');
    // });
    
  });

  /* ======================================================
     我的订单
  ====================================================== */
  describe('GET /api/orders/my', () => {
    it('200 返回自己的订单列表', async () => {
      const res = await createHttpRequest(app)
        .get('/api/orders/my')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toMatchObject({
        id: expect.any(Number),
        activity: expect.any(Object),
      });
    });

    it('401 未登录', async () => {
      await createHttpRequest(app).get('/api/orders/my').expect(401);
    });
  });

  /* ======================================================
     退款
  ====================================================== */
  describe('POST /api/orders/:id/refund', () => {
    let order: Order;

    beforeEach(async () => {
      // 每次新建一个订单
      const res = await createHttpRequest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ activityId: publishedAct.id });
      order = res.body;
    });

    it('200 全额退款', async () => {
      // 30 分钟内 -> 100%
      const res = await createHttpRequest(app)
        .post(`/api/orders/${order.id}/refund`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.refundPoints).toBe(100);

      const ds = await getDS();
      // 订单状态
      const o = await ds.getRepository(Order).findOneBy({ id: order.id });
      expect(o!.status).toBe('refunded');

      // 积分已返还
      const u = await ds.getRepository(User).findOneBy({ id: user.id });
      expect(u!.points).toBe(100);

      // 名额已回退
      const act = await ds
        .getRepository(Activity)
        .findOneBy({ id: publishedAct.id });
      expect(act!.enrolledCount).toBe(1);
    });

    it('409 不满足退款条件（活动开始前 3h 内）', async () => {
      // 把活动开始时间改到 1h 后
      const ds = await getDS();
      await ds
        .getRepository(Activity)
        .update(
          { id: publishedAct.id },
          { startAt: dayjs().add(1, 'hour').toDate() }
        );

      const res = await createHttpRequest(app)
        .post(`/api/orders/${order.id}/refund`)
        .set('Authorization', `Bearer ${token}`)
        .expect(409);

      expect(res.body.message).toBe('活动开始前 3 小时内不可退款');
    });

    it('404 订单不存在', async () => {
      await createHttpRequest(app)
        .post('/api/orders/9999/refund')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('401 未登录', async () => {
      await createHttpRequest(app)
        .post(`/api/orders/${order.id}/refund`)
        .expect(401);
    });
  });
});
