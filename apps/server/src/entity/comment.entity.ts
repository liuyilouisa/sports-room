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
import { User } from './user.entity';
import { Activity } from './activity.entity';

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

  /* ---------- ORM 关系 ---------- */
  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Activity, (activity) => activity.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  /* 一条评论可以有 N 条子评论（楼中楼） */
  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  @ManyToOne(() => Comment, (comment) => comment.children)
  parent: Comment;

  /* ---------- 时间戳 ---------- */
  @ApiProperty()
  @CreateDateColumn({ type: 'text' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'text' })
  updatedAt: Date;
}