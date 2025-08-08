import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@midwayjs/swagger';
import type { User } from './user.entity';
import type { Activity } from './activity.entity';
import type { Comment as IComment } from './comment.entity'; // 自引用类型

@Entity('comment')
export class Comment {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '这个活动太棒了！' })
  @Column({ type: 'text' })
  content: string;

  /* ---------- 关联字段 ---------- */
  @ApiProperty({ example: 1 })
  @Column({ type: 'int' })
  userId: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int' })
  activityId: number;

  /* ---------- 自关联：支持回复 ---------- */
  @Column({ type: 'int', nullable: true })
  parentId: number | null;

  /* ---------- ORM 关系，全部用字符串实体名 ---------- */
  @ManyToOne('User', 'comments', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne('Activity', 'comments', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  /* 一条评论可以有 N 条子评论（楼中楼） */
  @OneToMany('Comment', 'parent')
  children: IComment[];

  @ManyToOne('Comment', 'children', { onDelete: 'CASCADE' })
  parent: IComment;

  /* ---------- 时间戳 ---------- */
  @ApiProperty()
  @CreateDateColumn({ type: 'text' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'text' })
  updatedAt: Date;
}
