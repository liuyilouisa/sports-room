import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Activity } from '../entity/activity.entity';

@Provide()
export class ActivityService {
  @InjectEntityModel(Activity)
  activityRepo: Repository<Activity>;

  async paginate(opts: { page: number; size: number; keyword?: string }) {
    const { page, size, keyword } = opts;
    const where = keyword ? { title: Like(`%${keyword}%`) } : {};
    const [rows, total] = await this.activityRepo.findAndCount({
      where,
      skip: (page - 1) * size,
      take: size,
      order: { createdAt: 'DESC' },
    });
    return { rows, total, page, size };
  }
}
