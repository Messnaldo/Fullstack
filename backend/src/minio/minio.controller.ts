import { Controller, Get, Post, UploadedFile, UseInterceptors, HttpException, HttpStatus, Logger, Param, Res, Put, Body, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service'; // ปรับเส้นทางตามที่อยู่ของ service
import { Express, Response } from 'express';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import * as Minio from 'minio'
import { Bucket } from 'src/kafka/bucket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface CsvData {
  text: string;
  label: number;
}
interface CsvDataNew {
  text: string;
  label: number;
  confident_level: number | string;
  label_type: string;
}

@ApiTags('minio')
@Controller('minio')
export class MinioController {
  private readonly logger = new Logger(MinioController.name);
  private minioClient: Minio.Client
  private bucketName: string
  constructor( private readonly minioService: MinioService) {}

    @Get('receive/:bucketName/:objectName')
    @ApiOperation({ summary: 'Get file from Minio and convert to JSON' })
    @ApiParam({ name: 'bucketName', required: true, description: 'Name of the bucket' })
    @ApiParam({ name: 'objectName', required: true, description: 'Name of the object' })
    async read(@Param('bucketName') bucketName: string, @Param('objectName') objectName: string): Promise<CsvDataNew[]> {
      const result = await this.minioService.getFile(bucketName, objectName);
      console.log(result);
  
      // Split CSV data into lines
      const lines = result.split('\n').map(line => line.trim()).filter(line => line !== '');
      const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
      // Parse each line into a CSV data object
      const data = lines.slice(1).map((line, lineIndex) => {
        const values = this.parseCsvLine(line);
  
        const obj = headers.reduce((acc, header, index) => {
          const cleanHeader = header.trim();
          const value = values[index]?.trim().replace(/\\r/g, '').replace(/"/g, '') || '';
  
          if (cleanHeader === 'label') {
            const numericValue = Number(value);
            if (isNaN(numericValue) || ![0, 1, -1].includes(numericValue)) {
              console.error(`Invalid label value: ${value} at line ${lineIndex + 1}`);
              acc[cleanHeader] = null;
            } else {
              acc[cleanHeader] = numericValue;
            }
          } else if (cleanHeader === 'confident_level') {
            acc[cleanHeader] = value === '-' ? '-' : Number(value);
          } else {
            acc[cleanHeader] = value;
          }
  
          return acc;
        }, {} as CsvDataNew);
  
        return obj;
      }).filter(item => item !== null);
  
      const formattedData = data.map(item => ({
        text: item.text,
        label: item.label,
        confident_level: item.confident_level,
        label_type: item.label_type
      }));
  
      console.log(formattedData);
      return formattedData;
    }
  
   
    @Get('test/:bucketName/:objectName')
    @ApiOperation({ summary: 'Get file from Minio and save locally' })
    @ApiParam({ name: 'bucketName', required: true, description: 'Name of the bucket' })
    @ApiParam({ name: 'objectName', required: true, description: 'Name of the object' })
  async readandgetfile(@Param('bucketName') bucketName: string, @Param('objectName') objectName: string): Promise<string> {
    const result = await this.minioService.getFileAndCreateLocal(bucketName, objectName, 'sample_data.csv');
    
    console.log(`File saved locally at: ${result}`);
    console.log("workjudssIsus");

    return result;
  }
 

 
  @Get('receivetest/:hashtag')
  @ApiOperation({ summary: 'Get file from Minio and convert to JSON' })
  @ApiParam({ name: 'hashtag', required: true, description: 'Hashtag to search bucket' })
  async readfortest(@Param('hashtag') hashtag: string): Promise<CsvDataNew[]> {
    const existingBucket = await this.minioService.findBucketByHashtag(hashtag);
    if (!existingBucket) {
      throw new NotFoundException('No bucket found for the given hashtag');
    }

    const bucketName = existingBucket.bucketName;
    const objectName = 'labeled_data.csv';
    const result = await this.minioService.getFile(bucketName, objectName);
    console.log(result);

    // Split CSV data into lines
    const lines = result.split('\n').map(line => line.trim()).filter(line => line !== '');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));

    // Parse each line into a CSV data object
    const data = lines.slice(1).map((line, lineIndex) => {
      const values = this.parseCsvLine(line);

      const obj = headers.reduce((acc, header, index) => {
        const cleanHeader = header.trim();
        const value = values[index]?.trim().replace(/\\r/g, '').replace(/"/g, '') || '';

        if (cleanHeader === 'label') {
          const numericValue = Number(value);
          if (isNaN(numericValue) || ![0, 1, -1].includes(numericValue)) {
            console.error(`Invalid label value: ${value} at line ${lineIndex + 1}`);
            acc[cleanHeader] = null;
          } else {
            acc[cleanHeader] = numericValue;
          }
        } else if (cleanHeader === 'confident_level') {
          acc[cleanHeader] = value === '-' ? '-' : Number(value);
        } else {
          acc[cleanHeader] = value;
        }

        return acc;
      }, {} as CsvDataNew);

      return obj;
    }).filter(item => item !== null);

    const formattedData = data.map(item => ({
      text: item.text,
      label: item.label,
      confident_level: item.confident_level,
      label_type: item.label_type
    }));

    return formattedData;
  }

  private parseCsvLine(line: string): string[] {
    const values = [];
    let value = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(value);
        value = '';
      } else {
        value += char;
      }
    }

    values.push(value); // Push the last value
    return values;
  }



  @Put('update-test/:hashtag')
  @ApiOperation({ summary: 'Update file on Minio' })
  @ApiParam({ name: 'hashtag', required: true, description: 'Hashtag to search bucket' })
  async updateFile(
    @Param('hashtag') hashtag: string,
    @Body() data: CsvDataNew[]
  ): Promise<void> {
    const existingBucket = await this.minioService.findBucketByHashtag(hashtag);
    if (!existingBucket) {
      throw new NotFoundException('No bucket found for the given hashtag');
    }

    const bucketName = existingBucket.bucketName;
    const objectName = 'labeled_data.csv';

    // Set label to null if it has no value
    data.forEach(item => {
      if (item.label === undefined || item.label === null) {
        item.label = null;
      }
    });

    const csvContent = this.convertToCsv(data);
    await this.minioService.uploadFileFromString(bucketName, objectName, csvContent);
  }

  private convertToCsv(data: CsvDataNew[]): string {
    const headers = ['text', 'label', 'confident_level', 'label_type'];
    const csvRows = data.map(row =>
      headers.map(header => {
        let value = row[header];
        if (header === 'label' && (value === undefined || value === null)) {
          value = null; // Empty string for null labels
        }
        // Quote the value if it contains a comma or is not a number
        if (typeof value === 'string' && (value.includes(',') || isNaN(Number(value)))) {
          return `"${value.replace(/"/g, '""')}"`; // Escape quotes by doubling them
        }
        return value;
      }).join(',')
    );
    return [headers.join(','), ...csvRows].join('\n');
  }







  
}
