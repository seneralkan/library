export class CreateBorrowedBookDto {
  userId: number;
  bookId: number;
  borrowDate: Date;
  returned: boolean;
}
