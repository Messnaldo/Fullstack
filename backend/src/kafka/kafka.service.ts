
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientKafka, Transport, KafkaContext, Payload, MessagePattern, Ctx } from '@nestjs/microservices';
import { Subject, Observable, firstValueFrom } from 'rxjs';
import { MessagePayload } from './message-payload.interface';
import { KafkaGateway } from './kafka.gateway';
import * as csvWriter from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';
import { Bucket } from './bucket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class KafkaService implements OnModuleInit {
  private messages$ = new Subject<MessagePayload>();

  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'nestjs-client',
        brokers: ['192.168.13.74:29092'],
      },
      consumer: {
        groupId: 'nestjs-group'
      }
    }
  })
  kafkaClient: ClientKafka;

  constructor(
    @InjectRepository(Bucket)
    private readonly BucketRepository: Repository<Bucket>,private readonly kafkaGateway: KafkaGateway) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
    this.kafkaClient.subscribeToResponseOf('raw-data-topic');
    this.kafkaClient.subscribeToResponseOf('test-prediction-topic');
    this.kafkaClient.subscribeToResponseOf('test-raw-data-topic');
    this.kafkaClient.subscribeToResponseOf('prediction-topic');

  }

  async sendMessage(topic: string, message: any): Promise<void> {
    await this.kafkaClient.emit(topic, message).toPromise();
  }

  async receiveMessage(): Promise<MessagePayload> {
    return firstValueFrom(this.messages$);
  }

 
  getMessages(): Observable<MessagePayload> {
    return this.messages$.asObservable();
  }
  async findAllHashtags(): Promise<{ hashtag: string }[]> {
    return this.BucketRepository.find({
      select: ['hashtag'],
    });
  }
  
}
