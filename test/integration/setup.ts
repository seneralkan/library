import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource } from 'typeorm';

process.env.POSTGRES_HOST = '127.0.0.1';
process.env.POSTGRES_PORT = '55432';
process.env.POSTGRES_USERNAME = 'postgres';
process.env.POSTGRES_PASSWORD = 'postgres';
process.env.DATABASE_NAME = 'library_management_integration';
process.env.NODE_ENV = 'test';

import { AppModule } from '../../src/app.module';
import { ErrorFilter, HttpExceptionFilter } from '../../src/common/filters';

let app: NestFastifyApplication;
let dataSource: DataSource;

export function getApp(): NestFastifyApplication {
  return app;
}

export function getDataSource(): DataSource {
  return dataSource;
}

export async function truncateAllTables(): Promise<void> {
  await dataSource.query(
    'TRUNCATE TABLE borrowed_book, "user", book RESTART IDENTITY CASCADE;',
  );
}

export async function createUser(
  name: string,
): Promise<{ id: number; name: string }> {
  const response = await request(app.getHttpServer())
    .post('/users')
    .send({ name })
    .expect(201);
  return response.body;
}

export async function createBook(
  name: string,
): Promise<{ id: number; name: string; score: number }> {
  const response = await request(app.getHttpServer())
    .post('/books')
    .send({ name })
    .expect(201);
  return response.body;
}

export async function borrowBook(
  userId: number,
  bookId: number,
): Promise<void> {
  await request(app.getHttpServer())
    .post(`/users/${userId}/borrow/${bookId}`)
    .expect(204);
}

export async function returnBook(
  userId: number,
  bookId: number,
  score: number,
): Promise<void> {
  await request(app.getHttpServer())
    .post(`/users/${userId}/return/${bookId}`)
    .send({ score })
    .expect(204);
}

export async function setupTestApp(): Promise<void> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ErrorFilter(), new HttpExceptionFilter());

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  dataSource = app.get<DataSource>(getDataSourceToken('postgres'));
}

export async function teardownTestApp(): Promise<void> {
  await truncateAllTables();
  await app.close();
}
