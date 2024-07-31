import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bucket } from './bucket.entity';
import { KafkaGateway } from './kafka.gateway';
import { TestHistory } from './test-history.entity';
import { TestHistoryService } from './test-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bucket,TestHistory])
  ],
  providers: [KafkaService,KafkaGateway, TestHistoryService],
  controllers: [KafkaController],
  exports: [KafkaService],
})
export class KafkaModule {}
