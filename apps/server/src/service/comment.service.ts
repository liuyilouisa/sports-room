import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User, Comment } from '../entity';
import {
  CreateCommentDTO,
  CommentListDTO,
  CommentVO,
} from '../dto/comment.dto';

@Provide()
export class CommentService {
  @InjectEntityModel(Comment)
  commentRepo: Repository<Comment>;

  @InjectEntityModel(User)
  userRepo: Repository<User>;

  /* 发表评论 / 回复 */
  async create(userId: number, dto: CreateCommentDTO) {
    const comment = this.commentRepo.create({
      content: dto.content,
      activityId: dto.activityId,
      userId,
      parentId: dto.parentId ?? null,
    });
    return this.commentRepo.save(comment);
  }

  /* 分页拉取某活动的评论（含楼中楼）*/
  async paginateByActivity(activityId: number, dto: CommentListDTO) {
    const { page, size } = dto;

    const [data, total] = await this.commentRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('c.children', 'child')
      .leftJoinAndSelect('child.user', 'cu')
      .where('c.activityId = :activityId AND c.parentId IS NULL', {
        activityId,
      })
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const voList: CommentVO[] = data.map(c => ({
      id: c.id,
      content: c.content,
      parentId: c.parentId,
      userId: c.user.id,
      userName: c.user.name,
      createdAt: c.createdAt,
      children: c.children?.map(child => ({
        id: child.id,
        content: child.content,
        parentId: child.parentId,
        userId: child.user.id,
        userName: child.user.name,
        createdAt: child.createdAt,
      })),
    }));

    return { data: voList, total, page, size };
  }

  /* 删除自己的评论（管理员可删任何）*/
  async remove(id: number, userId: number, role: string) {
    const qb = this.commentRepo.createQueryBuilder().where('id = :id', { id });

    if (role !== 'admin') {
      qb.andWhere('userId = :userId', { userId });
    }

    const { affected } = await qb.delete().execute();
    return affected;
  }
}
