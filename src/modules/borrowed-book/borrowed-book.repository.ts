import { Injectable } from '@nestjs/common';
import { BorrowedBook } from 'src/models/borrowed-book.entity';
import { CreateBorrowedBookDto } from './dtos/create-borrowed-book.dto';
import { TransactionContextService } from 'src/infrastructure/database/transaction/transaction-context.service';

@Injectable()
export class BorrowedBookRepository {
  constructor(private readonly transactionContext: TransactionContextService) {}

  private get repository() {
    return this.transactionContext.getRepository(BorrowedBook);
  }

  async create(data: CreateBorrowedBookDto): Promise<BorrowedBook> {
    const borrowedBook = this.repository.create(data);
    return await this.repository.save(borrowedBook);
  }

  async findReturnedByBookId(bookId: number): Promise<BorrowedBook[]> {
    return await this.repository.find({
      where: { bookId, returned: true },
    });
  }

  async save(data: BorrowedBook): Promise<BorrowedBook> {
    return await this.repository.save(data);
  }
}
