import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { createSwaggerDocument } from '@config/swagger';
import { ErrorFilter, HttpExceptionFilter } from '@filters';
import { configuration } from '@config/server';

async function bootstrap() {
  const configService = configuration();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: { level: configService.server.logLevel },
      bodyLimit: configService.server.bodyLimit,
      keepAliveTimeout: configService.server.keepAliveTimeout,
    }),
  );

  SwaggerModule.setup('documentation', app, createSwaggerDocument(app));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new ErrorFilter(), new HttpExceptionFilter());

  await app.listen(configService.server.port, configService.server.host);
}
bootstrap();
