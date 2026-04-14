import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { BookModule } from '../book/book.module';
import { BorrowedBookModule } from '../borrowed-book/borrowed-book.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'postgres'),
    BookModule,
    BorrowedBookModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
