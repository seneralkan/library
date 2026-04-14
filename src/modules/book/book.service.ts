import { Injectable } from '@nestjs/common';
import { BookRepository } from './book.repository';
import { BookCreateDto } from './dtos/book-create.dto';
import { BookNotFound } from './exceptions/book-not-found.exception';
import { Book } from '@models';

@Injectable()
export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  async create(data: BookCreateDto) {
    return await this.bookRepository.create(data);
  }

  async save(book: Book) {
    return await this.bookRepository.save(book);
  }

  async findAll() {
    return await this.bookRepository.findAll();
  }

  async findOneWithoutAvailability(id: number) {
    const book = await this.bookRepository.findOneWithoutAvailability(id);
    if (!book) {
      throw new BookNotFound(id);
    }
    return {
      id: book.id,
      name: book.name,
      score: book.score === -1 ? -1 : Number(book.score.toFixed(2)),
    };
  }

  async findOne(id: number) {
    const book = await this.bookRepository.findOne(id);
    if (!book) {
      throw new BookNotFound(id);
    }
    return book;
  }

  async findOneForUpdate(id: number) {
    const book = await this.bookRepository.findOneForUpdate(id);
    if (!book) {
      throw new BookNotFound(id);
    }
    return book;
  }
}
