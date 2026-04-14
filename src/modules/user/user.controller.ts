import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation } from '@nestjs/swagger';
import { UserCreateDto } from './dtos/user-create.dto';
import { UserReturnBookRequestDto } from './dtos/user-return-book.request.dto';

@Controller('/users')
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  async getAllUserHandler() {
    return await this.service.findAll();
  }

  @Get('/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by id' })
  async getUserByIdHandler(@Param('userId', ParseIntPipe) userId: number) {
    return await this.service.findOneWithBorrowHistory(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user' })
  async createUserHandler(@Body() data: UserCreateDto) {
    return await this.service.create(data);
  }

  @Post('/:userId/borrow/:bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Borrow book' })
  async borrowBookHandler(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    await this.service.borrowBook(userId, bookId);
  }

  @Post('/:userId/return/:bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Return book' })
  async returnBook(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() req: UserReturnBookRequestDto,
  ) {
    await this.service.returnBook(userId, bookId, req.score);
  }
}
