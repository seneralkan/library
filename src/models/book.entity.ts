import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BorrowedBook } from './borrowed-book.entity';

@Entity('book')
export class Book {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'double precision', nullable: false, default: -1 })
  score: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  available: boolean;

  // Book entity has a one-to-many relationship with the BorrowedBook entity.
  @OneToMany(() => BorrowedBook, (borrowedBook) => borrowedBook.book, {
    eager: false,
  })
  borrowedBooks: BorrowedBook[];

  markAsBorrowed(): this {
    this.available = false;
    return this;
  }

  markAsAvailable(): this {
    this.available = true;
    return this;
  }

  updateScore(score: number): this {
    this.score = score;
    return this;
  }
}
