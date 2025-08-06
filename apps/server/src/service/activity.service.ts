import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../entity/activity.entity';

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

@Provide()
export class ActivityService {
  @InjectEntityModel(Activity)
  activityRepo: Repository<Activity>;

  /**
   * 分页 & 关键字搜索
   */
  async search({
    keyword = '',
    page = 1,
    size = 10,
    sort = 'createdAt_DESC',
  }: {
    keyword?: string;
    page?: number;
    size?: number;
    sort?: string; // 形如 createdAt_DESC / createdAt_ASC / title_ASC ...
  }): Promise<PageResult<Activity>> {
    const [column, order] = sort.split('_');
    const qb = this.activityRepo
      .createQueryBuilder('activity')
      .where('activity.status = :status', { status: 'published' });

    if (keyword) {
      qb.andWhere(
        '(activity.title LIKE :kw OR activity.description LIKE :kw)',
        { kw: `%${keyword}%` }
      );
    }

    const [data, total] = await qb
      .orderBy(`activity.${column}`, order as 'ASC' | 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return { data, total, page, size };
  }

  /**
   * 根据 id 获取已发布的活动
   */
  async findPublishedById(id: number): Promise<Activity | null> {
    return this.activityRepo.findOneBy({ id, status: 'published' });
  }
}
