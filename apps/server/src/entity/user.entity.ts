import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@midwayjs/swagger';
import { Comment } from './comment.entity';

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

  @ApiProperty()
  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];
}
