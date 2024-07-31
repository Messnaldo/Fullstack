import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import * as session from 'express-session';
import * as passport from 'passport';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { FrontendMiddleware } from './app.middleware';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(new FrontendMiddleware().use)
  
  app.enableCors({
    origin: '*', // Angular app URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `consumer-nestjs`,
        brokers: ['192.168.13.74:29092'],
      },
      consumer:{
        groupId: 'nest-server'
      }
    }
  })
 
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Full stack development')
    .setDescription('Here is the list of api that is used in management system for social sentiment analysis project')
    .setVersion('1.0')
    
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swag', app, document);
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));

  await app.startAllMicroservices()
  app.use(
    session({
      secret: 'your_secret_key', // Replace with a strong secret key
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 hour
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(3000);
}
bootstrap();
