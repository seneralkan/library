import { BorrowedBook } from '@models';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BorrowedBookLogic {
  calculateAverageScore(books: BorrowedBook[]) {
    const scoredBooks = books.filter((book) => Number.isInteger(book.score));
    if (scoredBooks.length === 0) {
      return -1;
    }

    const totalScore = scoredBooks.reduce((sum, book) => sum + book.score, 0);
    const averageScore = totalScore / scoredBooks.length;
    return Number(averageScore.toFixed(2));
  }
}
