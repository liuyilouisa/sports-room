import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@midwayjs/swagger';

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

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
