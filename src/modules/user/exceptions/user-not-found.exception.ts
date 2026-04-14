import { HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES } from '@constants';
import { InventException } from '@exceptions';

export class UserNotFoundException extends InventException {
  constructor(id: number) {
    super(
      `User with id ${id} not found`,
      ERROR_MESSAGES.VALIDATION.code,
      HttpStatus.NOT_FOUND,
    );
  }
}
