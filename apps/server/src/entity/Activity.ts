import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn() id: number;
  @Column() title: string;
  @Column('text', { nullable: true }) description: string;
  @Column({ type: 'datetime' }) startAt: Date;
  @Column({ default: 20 }) quota: number;
  @Column({ default: 'pending' }) status: string;
  @CreateDateColumn() createdAt: Date;
}