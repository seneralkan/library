import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User, Book } from '@models';

@Entity('borrowed_book')
export class BorrowedBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: false,
  })
  userId: number;

  @Column({
    name: 'book_id',
    type: 'int',
    nullable: false,
  })
  bookId: number;

  @Column({ type: 'date', nullable: false })
  borrowDate: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  returned: boolean;

  @Column({ type: 'date', nullable: true })
  returnDate: Date;

  @Column({ type: 'int', nullable: true })
  score: number;

  @ManyToOne(() => User, (user) => user.borrowedBooks, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.borrowedBooks, { eager: false })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  markAsReturned(score: number, returnDate: Date): this {
    this.returned = true;
    this.score = score;
    this.returnDate = returnDate;
    return this;
  }

  attachBook(book: Book): this {
    this.book = book;
    return this;
  }
}
