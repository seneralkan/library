import { Injectable } from '@nestjs/common';
import { Book } from '@models';
import { BookCreateDto } from './dtos/book-create.dto';
import { TransactionContextService } from 'src/infrastructure/database/transaction/transaction-context.service';

@Injectable()
export class BookRepository {
  constructor(private readonly transactionContext: TransactionContextService) {}

  private get repository() {
    return this.transactionContext.getRepository(Book);
  }

  async create(data: BookCreateDto): Promise<Book> {
    const book = this.repository.create(data);
    return await this.repository.save(book);
  }

  async save(book: Book): Promise<Book> {
    return await this.repository.save(book);
  }

  async findAll(): Promise<Partial<Book>[]> {
    return await this.repository
      .createQueryBuilder('book')
      .select(['book.id', 'book.name'])
      .orderBy('book.name', 'ASC')
      .getMany();
  }

  async findOneWithoutAvailability(id: number): Promise<Book> {
    return await this.repository
      .createQueryBuilder('book')
      .select(['book.id', 'book.name', 'book.score'])
      .where('book.id = :id', { id })
      .getOne();
  }

  async findOne(id: number): Promise<Book> {
    return await this.repository.findOne({ where: { id } });
  }

  async findOneForUpdate(id: number): Promise<Book> {
    return await this.repository
      .createQueryBuilder('book')
      .setLock('pessimistic_write')
      .where('book.id = :id', { id })
      .getOne();
  }
}
