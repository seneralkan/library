import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { BorrowedBookModule } from './borrowed-book/borrowed-book.module';

@Module({
  imports: [UserModule, BookModule, BorrowedBookModule],
})
export class ApiModule {}
