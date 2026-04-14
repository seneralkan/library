import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowedBook } from '@models';
import { BorrowedBookService } from './borrowed-book.service';
import { BorrowedBookRepository } from './borrowed-book.repository';
import { BorrowedBookLogic } from './borrowed-book.logic';

@Module({
  imports: [TypeOrmModule.forFeature([BorrowedBook], 'postgres')],
  providers: [BorrowedBookService, BorrowedBookRepository, BorrowedBookLogic],
  exports: [BorrowedBookService, BorrowedBookRepository, BorrowedBookLogic],
})
export class BorrowedBookModule {}
