import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User, Activity, Order } from '../entity';
import { CreateOrderDTO } from '../dto/order.dto';
import { BizError } from '../error/http.error';
import * as dayjs from 'dayjs';
import { randomBytes } from 'crypto';

@Provide()
export class OrderService {
  @InjectEntityModel(Order) orderRepo: Repository<Order>;
  @InjectEntityModel(Activity) activityRepo: Repository<Activity>;
  @InjectEntityModel(User) userRepo: Repository<User>;

  async create(userId: number, dto: CreateOrderDTO) {
    return this.orderRepo.manager.transaction(async em => {
      /* 1. 检查活动 */
      const activity = await em.findOne(Activity, {
        where: { id: dto.activityId },
      });
      if (!activity)
        throw new BizError('ACTIVITY_NOT_FOUND', 404, '活动不存在');
      if (activity.status !== 'published')
        throw new BizError('ACTIVITY_NOT_PUBLISHED', 409, '活动未发布');
      if (dayjs().isAfter(dayjs(activity.endAt)))
        throw new BizError('ACTIVITY_ALREADY_ENDED', 409, '活动已结束');
      if (dayjs().isAfter(dayjs(activity.startAt).subtract(3, 'hour')))
        throw new BizError(
          'ACTIVITY_REGISTRATION_CLOSED',
          409,
          '活动已开始前 3 小时，禁止报名'
        );

      if (activity.enrolledCount >= activity.capacity)
        throw new BizError('ACTIVITY_ENROLLED_COUNT_EXCEEDED', 409, '名额已满');

      /* 2. 检查用户积分 */
      const user = await em.findOne(User, { where: { id: userId } });
      if (!user) throw new BizError('USER_NOT_FOUND', 404, '用户不存在');
      const cost = 100; // 如需动态，可从 activity.costPoints 取
      if (user.points < cost)
        throw new BizError('USER_INSUFFICIENT_POINTS', 409, '积分不足');

      /* 3. 乐观锁扣名额 */
      const updateRes = await em
        .createQueryBuilder()
        .update(Activity)
        .set({
          enrolledCount: () => 'enrolledCount + 1',
          lockVer: () => 'lockVer + 1',
        })
        .where('id = :id AND lockVer = :lockVer', {
          id: dto.activityId,
          lockVer: activity.lockVer,
        })
        .execute();
      if (updateRes.affected === 0)
        throw new BizError(
          'CONCURRENT_CONFLICT',
          409,
          '名额已被抢光，请稍后再试'
        );

      /* 4. 生成订单 */
      const secret = randomBytes(4).toString('hex');
      const order = em.create(Order, {
        userId,
        activityId: dto.activityId,
        costPoints: cost,
        secret,
      });
      await em.save(order);

      /* 5. 扣积分 */
      await em.decrement(User, { id: userId }, 'points', cost);

      return order;
    });
  }

  async refund(orderId: number, userId: number) {
    return this.orderRepo.manager.transaction(async em => {
      const order = await em.findOne(Order, {
        where: { id: orderId, userId },
        relations: ['activity'],
      });
      if (!order) throw new BizError('ORDER_NOT_FOUND', 404, '订单不存在');
      if (order.status !== 'paid')
        throw new BizError('ORDER_STATUS_EXCEPTION', 409, '订单状态异常');
      const start = dayjs(order.activity.startAt);
      const now = dayjs();
      if (now.isAfter(start.subtract(3, 'hour')))
        throw new BizError(
          'REFUND_NOT_ALLOWED',
          409,
          '活动开始前 3 小时内不可退款'
        );
      if (dayjs().isAfter(dayjs(order.activity.endAt)))
        throw new BizError(
          'ACTIVITY_ALREADY_ENDED',
          409,
          '活动已结束，不可退款'
        );

      /* 计算退还积分 */
      const hours = now.diff(order.createdAt, 'hour');
      const refundRatio = Math.max(0.1, 1 - hours / 24); // 24h 线性递减，最低退 10%
      const refundPoints = Math.floor(order.costPoints * refundRatio);

      /* 更新订单状态 */
      order.status = 'refunded';
      await em.save(order);

      /* 返还积分 */
      await em.increment(User, { id: userId }, 'points', refundPoints);

      /* 乐观锁还名额 */
      const refundRes = await em
        .createQueryBuilder()
        .update(Activity)
        .set({
          enrolledCount: () => 'enrolledCount - 1',
          lockVer: () => 'lockVer + 1',
        })
        .where('id = :id AND lockVer = :lockVer', {
          id: order.activityId,
          lockVer: order.activity.lockVer,
        })
        .execute();

      if (refundRes.affected === 0) {
        throw new BizError(
          'REFUND_CONFLICT',
          409,
          '退款失败，名额回退冲突，请重试'
        );
      }

      return { refundPoints };
    });
  }

  async myOrders(userId: number) {
    return this.orderRepo.find({
      where: { userId },
      relations: ['activity'],
      order: { createdAt: 'DESC' },
    });
  }
}
