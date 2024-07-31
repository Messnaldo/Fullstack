import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Dag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: string;

  @Column()
  schedule: string;

  @Column()
  hashtag: string;
  
  @Column()
  dag_id: string;
  // Other fields...
}