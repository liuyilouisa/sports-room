import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Check,
} from 'typeorm';
import { ApiProperty } from '@midwayjs/swagger';
import { User } from './user.entity';
import { Activity } from './activity.entity';

@Entity('orders')
export class Order {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, u => u.orders, {onDelete: 'CASCADE'})
  user: User;

  @ManyToOne(() => Activity, a => a.orders, {onDelete: 'CASCADE'})
  activity: Activity;

  @Column({ type: 'int' })
  costPoints: number;

  @Column({ type: 'varchar', length: 8 })
  secret: string;

  @Column({
    type: 'text',
    default: 'paid',
  })
  @Check(`status IN ('paid', 'refunded', 'expired')`)
  status: 'paid' | 'refunded' | 'expired';

  @CreateDateColumn()
  createdAt: Date;

  /* 冗余字段，方便查询 */
  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  activityId: number;
}
