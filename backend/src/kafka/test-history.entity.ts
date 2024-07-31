import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class TestHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  label: number;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
