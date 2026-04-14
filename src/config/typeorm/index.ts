import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Book, BorrowedBook, User } from '@models';

config();

export const TypeORMOptions: TypeOrmModuleAsyncOptions = {
  name: 'postgres',
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    name: 'postgres',
    type: 'postgres',
    host: configService.get('postgres.host'),
    port: parseInt(configService.get('postgres.port'), 10),
    username: configService.get('postgres.username'),
    password: configService.get('postgres.password'),
    database: configService.get('postgres.name'),
    entities: [Book, BorrowedBook, User],
    synchronize: true,
  }),
};
