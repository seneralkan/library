import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UserCreateDto } from './dtos/user-create.dto';
import { BorrowedBookService } from '../borrowed-book/borrowed-book.service';
import { BookService } from '../book/book.service';
import { UserWithBorrowHistoryDto } from './dtos/user-with-borrow-history.dto';
import { BookIsNotAvailable } from '../book/exceptions/book-is-not-available.exception';
import { UserDontHaveBorrowedBookException } from './exceptions/user-dont-have-borrowed-book.exception';
import { BorrowedBookLogic } from '../borrowed-book/borrowed-book.logic';
import { TransactionContextService } from 'src/infrastructure/database/transaction/transaction-context.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bookService: BookService,
    private readonly borrowedBookService: BorrowedBookService,
    private readonly borrowedBookLogic: BorrowedBookLogic,
    private readonly transactionContext: TransactionContextService,
  ) {}

  async create(data: UserCreateDto) {
    return await this.userRepository.create(data);
  }

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  async findOneWithBorrowHistory(
    id: number,
  ): Promise<UserWithBorrowHistoryDto> {
    const user = await this.userRepository.findOneWithBorrowHistory(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    return {
      id: user.id,
      name: user.name,
      books: {
        past: user.borrowedBooks
          .filter((book) => book.returned)
          .map((book) => {
            return {
              name: book.book.name,
              userScore: book.score,
            };
          }),
        present: user.borrowedBooks
          .filter((book) => !book.returned)
          .map((book) => {
            return { name: book.book.name };
          }),
      },
    };
  }

  async borrowBook(userId: number, bookId: number): Promise<void> {
    await this.transactionContext.runInTransaction(async () => {
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new UserNotFoundException(userId);
      }

      const book = await this.bookService.findOneForUpdate(bookId);
      if (!book.available) {
        throw new BookIsNotAvailable(book.id, book.name);
      }

      await this.borrowedBookService.create({
        userId: user.id,
        bookId: book.id,
        borrowDate: new Date(),
        returned: false,
      });

      await this.bookService.save(book.markAsBorrowed());
    });
  }

  async returnBook(
    userId: number,
    bookId: number,
    score: number,
  ): Promise<void> {
    await this.transactionContext.runInTransaction(async () => {
      const user = await this.userRepository.findOneWithBorrowHistory(userId);
      if (!user) {
        throw new UserNotFoundException(userId);
      }

      const book = await this.bookService.findOneForUpdate(bookId);
      const borrowedBook = user.borrowedBooks.find(
        (borrowed) => borrowed.bookId === book.id && !borrowed.returned,
      );

      if (!borrowedBook) {
        throw new UserDontHaveBorrowedBookException(user.name, book.name);
      }

      await this.borrowedBookService.save(
        borrowedBook.markAsReturned(score, new Date()).attachBook(book),
      );

      const returnedBorrowedBooks =
        await this.borrowedBookService.findReturnedByBookId(book.id);
      const averageScore = this.borrowedBookLogic.calculateAverageScore(
        returnedBorrowedBooks,
      );

      await this.bookService.save(
        book.markAsAvailable().updateScore(averageScore),
      );
    });
  }
}
