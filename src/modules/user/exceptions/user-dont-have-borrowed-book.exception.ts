import { HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES } from '@constants';
import { InventException } from '@exceptions';

export class UserDontHaveBorrowedBookException extends InventException {
  constructor(userName: string, bookName: string) {
    super(
      `User ${userName} don't have borrowed book ${bookName}`,
      ERROR_MESSAGES.VALIDATION.code,
      HttpStatus.NOT_FOUND,
    );
  }
}
