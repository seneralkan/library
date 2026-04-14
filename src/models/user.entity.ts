import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BorrowedBook } from './borrowed-book.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // User entity has a one-to-many relationship with the BorrowedBook entity.
  @OneToMany(() => BorrowedBook, (borrowedBook) => borrowedBook.user, {
    eager: false,
  })
  borrowedBooks: BorrowedBook[];
}
