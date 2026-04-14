import { Injectable } from '@nestjs/common';
import { User } from '@models';
import { UserCreateDto } from './dtos/user-create.dto';
import { TransactionContextService } from 'src/infrastructure/database/transaction/transaction-context.service';

@Injectable()
export class UserRepository {
  constructor(private readonly transactionContext: TransactionContextService) {}

  private get repository() {
    return this.transactionContext.getRepository(User);
  }

  async create(data: UserCreateDto): Promise<User> {
    const user = this.repository.create(data);
    return await this.repository.save(user);
  }

  async save(user: User): Promise<User> {
    return await this.repository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find({
      select: ['id', 'name'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<User> {
    return await this.repository.findOne({ where: { id } });
  }

  async findOneWithBorrowHistory(id: number): Promise<User> {
    return await this.repository.findOne({
      where: { id },
      relations: ['borrowedBooks', 'borrowedBooks.book'],
    });
  }
}
