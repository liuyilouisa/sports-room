import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@midwayjs/swagger';
import type { Comment } from './comment.entity';
import { Order } from './order.entity';

@Entity()
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Column()
  name: string;

  @ApiProperty({ example: 'password123' })
  @Column()
  password: string;

  @ApiProperty({ example: 'user' })
  @Column({ default: 'user' })
  role: string;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'int', default: 1000 })
  points: number;

  @OneToMany('Comment', 'user')
  comments: Comment[];

  @OneToMany(() => Order, o => o.user)
  orders: Order[];
}
