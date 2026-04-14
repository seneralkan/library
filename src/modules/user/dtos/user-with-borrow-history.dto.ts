export class BookHistoryDetailDto {
  name: string;
  userScore?: number;
}

export class BookHistoryDto {
  past: BookHistoryDetailDto[];
  present: BookHistoryDetailDto[];
}

export class UserWithBorrowHistoryDto {
  id: number;
  name: string;
  books: BookHistoryDto;
}
