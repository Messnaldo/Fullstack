import { Controller, Post, Body, Get , Query, Param, NotFoundException, Put} from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Ctx, KafkaContext, MessagePattern, Payload } from '@nestjs/microservices';
import { Subject, Observable } from 'rxjs';
import { MessagePayload,CSVPayload } from './message-payload.interface';
import { KafkaGateway } from './kafka.gateway';
import { parse } from 'json2csv';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as Minio from 'minio';
import { Bucket } from './bucket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v3 as uuidv3 } from 'uuid';
import { TestHistory } from './test-history.entity';
import { TestHistoryService } from './test-history.service';

const NAMESPACE_URL = uuidv3.URL;
interface CsvDataNew {
  text: string;
  label: number;
  confident_level: number | string;
  label_type: string;
}
@ApiTags('kafka')
@Controller('messages')
export class KafkaController {
  private messages$ = new Subject<any>();
  private minioClient: Minio.Client;
  private receivedMessages: any[] = [];

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly kafkaGateway: KafkaGateway,
    @InjectRepository(Bucket)
    private readonly bucketRepository: Repository<Bucket>,
    private readonly testHistoryService: TestHistoryService
   
  ) {
    const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'admin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'admin123';

    // Initialize MinIO client
    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  @ApiOperation({ summary: 'Send a message to Kafka and notify clients via WebSocket' })
  @ApiBody({ schema: { type: 'object', properties: { text: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'The message has been successfully sent and clients notified.' })
  @Post()
  async sendAndNotifyClients(@Body('text') text: string) {
    await this.kafkaService.sendMessage('test-raw-data-topic', { text });
    console.log(typeof text);
    // The notification to clients will be handled by the KafkaService's handleMessage method
  }

  @MessagePattern('test-prediction-topic')
  async handleMessage(@Payload() message: any, @Ctx() context: KafkaContext) {
    const originalMessage = context.getMessage();
    const partition = context.getPartition();
    const { headers, timestamp } = originalMessage;

    const payload: MessagePayload = {
      value: message.value ? message.value.toString() : JSON.stringify(message),
      partition,
      headers,
      timestamp,
    };

    console.log('Received message:', payload);
    this.kafkaGateway.sendMessageToClients(payload);


    console.log(payload); 
  }
 
  // --------------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Search for bucket and file by hashtag' })
  @ApiResponse({ status: 200, description: 'Bucket and file information retrieved successfully.' })
  @Get('/search')
  async searchByHashtag(@Query('hashtag') hashtag: string): Promise<any> {
    const existingBucket = await this.bucketRepository.findOne({ where: { hashtag } });
    if (existingBucket) {
      return { bucketName: existingBucket.bucketName, fileName: 'labeled_data.csv' };
    } else {
      return { error: 'No bucket found for the given hashtag' };
    }
  }
  // -----------------------------------------------------------------------------------------------------------------------
  @MessagePattern('prediction-topic')
async handleAnotherMessage(@Payload() message: any, @Ctx() context: KafkaContext) {
  const originalMessage = context.getMessage();
  const partition = context.getPartition();
  const { key, headers, timestamp } = originalMessage;

  if (!key) {
    console.error('Key is null or undefined');
    return;
  }

  const keyString = key.toString();

  

  const existingBucket = await this.bucketRepository.findOne({ where: { hashtag: keyString } });

  let bucketName: string;
  if (existingBucket) {
    bucketName = existingBucket.bucketName;
  } else {
    const uuidKey = uuidv3(keyString, NAMESPACE_URL);
    bucketName = `tweet-bucket-${uuidKey}`;

    try {
      const bucketExists = await this.minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
        console.log(`Bucket ${bucketName} created successfully.`);
      } else {
        console.log(`Bucket ${bucketName} already exists.`);
      }
    } catch (err) {
      console.error('Error creating bucket:', err);
      return;
    }

    const bucketRecord = new Bucket();
    bucketRecord.hashtag = keyString;
    bucketRecord.bucketName = bucketName;
    console.log(bucketRecord);
    await this.bucketRepository.save(bucketRecord);
    console.log(`Saved key and bucketName to database: ${JSON.stringify(bucketRecord)}`);
  }

  console.log(`message: ${JSON.stringify(message)}`);

  const result = message.map((value) => {
    const { text, label } = value;
    return { text, label };
  });

  console.log(`result: ${JSON.stringify(result)}`);

  const csvData = message;

  let csvValue: string;
  try {
    csvValue = parse(csvData);
  } catch (err) {
    console.error('Error converting JSON to CSV:', err);
    csvValue = ''; 
  }

  const tempFilePath = `./labeled_data.csv`;

  try {
    const objectsList = await this.minioClient.listObjectsV2(bucketName, '', true);
    let fileExists = false;
    for await (const obj of objectsList) {
      if (obj.name === `labeled_data.csv`) {
        fileExists = true;
        break;
      }
    }

    if (fileExists) {
      const tempDownloadFilePath = `./labeled_data.csv`;
      await this.minioClient.fGetObject(bucketName, `labeled_data.csv`, tempDownloadFilePath);
      const existingCSV = fs.readFileSync(tempDownloadFilePath, 'utf8');
      
      csvValue = existingCSV + '\n' + csvValue.split('\n').slice(1).join('\n');

      fs.unlinkSync(tempDownloadFilePath);
    }

    fs.writeFileSync(tempFilePath, csvValue);

    
    await this.minioClient.fPutObject(bucketName, `labeled_data.csv`, tempFilePath);
    console.log(`CSV file uploaded to bucket ${bucketName} successfully.`);

    
    fs.unlinkSync(tempFilePath);
  } catch (err) {
    console.error('Error handling CSV file in MinIO:', err);
    return;
  }

  const payload: CSVPayload = {
    key: keyString,
    value: csvValue,
    partition,
    headers,
    timestamp,
  };

  console.log('Received message:', payload);
  
  this.receivedMessages.push(payload);
}
@ApiOperation({ summary: 'Get all hashtags' })
@ApiResponse({ status: 200, description: 'Hashtags retrieved successfully.' })
@Get('hashtag')
async findAllHashtags(): Promise<{ hashtag: string }[]> {
  return this.kafkaService.findAllHashtags();
}


}
