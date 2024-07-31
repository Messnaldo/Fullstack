import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { MinioService } from './minio/minio.service';
import { MinioController } from './minio/minio.controller';
import { KafkaModule } from './kafka/kafka.module';
import { KafkaController } from './kafka/kafka.controller';
import { KafkaService } from './kafka/kafka.service';
import { MinioModule } from './minio/minio.module';
import { Bucket } from './kafka/bucket.entity';
import { AuthModule } from './auth/auth.module';
import { DagsModule } from './dags/dags.module';
import { join } from 'path';
import { FrontendMiddleware } from './app.middleware';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: '192.168.13.74', // or the service name if running in Docker
    port: 25432,
    username: 'airflow',
    password: 'airflow',
    database: 'postgres',
    entities: [Bucket],
    synchronize: true,
    autoLoadEntities: true,
    // type: 'postgres',
    // host: '10.0.1.54',
    // port: 5432,
    // username: 'citizix_user',
    // password: 'P@ssw0rd',
    // database: 'postgres',
    // entities: [Bucket],
    // synchronize: true,
    // autoLoadEntities: true,
  }),
  TypeOrmModule.forFeature([Bucket])

  
    ,
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'client/browser'),
    serveStaticOptions:{
      index: ['index.csr.html']
    }
  }),


    KafkaModule,
    MinioModule,

    AuthModule,

    DagsModule


  ],
  controllers: [AppController, MinioController],
  providers: [AppService, MinioService],
  exports: [MinioService]
})
export class AppModule  {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(FrontendMiddleware)
  //     .forRoutes('/');
  // }
}

