import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bucket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hashtag: string;

  @Column()
  bucketName: string;
}
