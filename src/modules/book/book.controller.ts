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
import { ApiOperation } from '@nestjs/swagger';
import { BookService } from './book.service';
import { BookCreateDto } from './dtos/book-create.dto';

@Controller('/books')
export class BookController {
  constructor(private service: BookService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all books' })
  async getAllBookHandler() {
    return await this.service.findAll();
  }

  @Get('/:bookId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get book by id' })
  async getBookByIdHandler(@Param('bookId', ParseIntPipe) bookId: number) {
    return await this.service.findOneWithoutAvailability(bookId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a book' })
  async createBookHandler(@Body() data: BookCreateDto) {
    return await this.service.create(data);
  }
}
