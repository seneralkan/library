import { HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES } from '@constants';
import { InventException } from '@exceptions';

export class BookIsNotAvailable extends InventException {
  constructor(id: number, name: string) {
    super(
      `${name} book with id ${id} is not available`,
      ERROR_MESSAGES.VALIDATION.code,
      HttpStatus.BAD_REQUEST,
    );
  }
}
