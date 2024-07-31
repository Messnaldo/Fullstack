import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { Bucket } from 'src/kafka/bucket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [ 
    TypeOrmModule.forFeature([Bucket])
  ],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}