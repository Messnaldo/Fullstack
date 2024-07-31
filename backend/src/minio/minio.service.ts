import { Injectable, Logger } from '@nestjs/common';
import { log } from 'console';
import { Client } from 'minio';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import { Bucket } from 'src/kafka/bucket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class MinioService {
    private readonly minioClient: Client;
    private readonly logger = new Logger(MinioService.name);
    private readonly bucketName = 'sampledata';  // Updated bucket name
    constructor( @InjectRepository(Bucket)
    private readonly bucketRepository: Repository<Bucket>) {
        const endPoint = process.env.MINIO_ENDPOINT ;
        const port = parseInt(process.env.MINIO_PORT || '29000', 10);
        const useSSL = process.env.MINIO_USE_SSL === 'true';
        this.minioClient = new Client({
          endPoint,
          port,
          useSSL,
          accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
          secretKey: process.env.MINIO_SECRET_KEY || 'admin123',
        });
      }
   
      async uploadFile(filePath: string, fileName: string): Promise<void> {
        try {
          const fileStream = fs.createReadStream(filePath);
          const fileStat = fs.statSync(filePath);
    
          await this.minioClient.putObject(this.bucketName, fileName, fileStream, fileStat.size);
          this.logger.log(`File uploaded successfully: ${fileName}`);
        } catch (error) {
          this.logger.error('Error uploading file to Minio:', error);
          throw error;
        }
      }
      async createBucketIfNotExists() {
        const bucketExists = await this.minioClient.bucketExists(this.bucketName)
        if (!bucketExists) {
          await this.minioClient.makeBucket(this.bucketName, 'eu-west-1')
        }
      }
      async getFileUrl(fileName: string) {
        return await this.minioClient.presignedUrl('GET', this.bucketName, fileName)
      }
    
      async getFile(bucketName: string, objectName: string): Promise<string> {
        const stream: Readable = await this.minioClient.getObject(bucketName, objectName);
        return new Promise<string>((resolve, reject) => {
          let data = '';
          stream.on('data', (chunk) => {
            data += chunk;
          });
          stream.on('end', () => {
            resolve(data);
          });
          stream.on('error', (err) => {
            reject(err);
          });
        });
      }
 async getFileAndCreateLocal(bucketName: string, objectName: string, localFileName: string): Promise<string> {
        const stream: Readable = await this.minioClient.getObject(bucketName, objectName);
       return new Promise<string>((resolve, reject) => {
        const filePath = path.join(__dirname, localFileName);
        const writeStream = fs.createWriteStream(filePath);
    
         stream.pipe(writeStream);
    
          stream.on('end', () => {
           resolve(filePath);
       });
    
          stream.on('error', (err) => {
         reject(err);
  });
    
        writeStream.on('error', (err) => {
            reject(err);
         });
      });
     }
   
    async uploadFileFromString(bucketName: string, objectName: string, fileContent: string): Promise<void> {
      const buffer = Buffer.from(fileContent, 'utf-8');
      const fileStream = new stream.PassThrough();
      fileStream.end(buffer);
    
      await this.minioClient.putObject(bucketName, objectName, fileStream, buffer.length, {
        'Content-Type': 'application/csv'
      });
      this.logger.log(`File uploaded successfully: ${objectName}`);
    }
    async findBucketByHashtag(hashtag: string): Promise<Bucket | undefined> {
      return this.bucketRepository.findOne({ where: { hashtag } });
    }
  }
