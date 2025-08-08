import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@midwayjs/swagger';
import type { Comment } from './comment.entity';

@Entity('activity')
export class Activity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '篮球友谊赛' })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({ example: '本周六下午 3 点...' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: 30 })
  @Column({ type: 'int' })
  capacity: number;

  @ApiProperty({ enum: ['draft', 'published'], example: 'published' })
  @Column({ type: 'varchar', default: 'published' })
  status: 'draft' | 'published';

  @ApiProperty({ example: '2024-08-10T15:00:00.000Z' })
  @Column({ type: 'text' })
  startAt: Date;

  @ApiProperty({ example: '2024-08-10T17:00:00.000Z' })
  @Column({ type: 'text', nullable: true })
  endAt: Date | null;

  @ApiProperty({ example: 0 })
  @Column({ type: 'int', default: 0 })
  enrolledCount: number;

  @ApiProperty()
  @CreateDateColumn({ type: 'text' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'text' })
  updatedAt: Date;

  @OneToMany('Comment', 'activity')
  comments: Comment[];
}
