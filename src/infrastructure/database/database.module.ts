import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeORMOptions } from '@config/typeorm';
import { TransactionContextService } from './transaction/transaction-context.service';

@Global()
@Module({
  imports: [TypeOrmModule.forRootAsync(TypeORMOptions)],
  providers: [TransactionContextService],
  exports: [TransactionContextService],
})
export class DatabaseModule {}
