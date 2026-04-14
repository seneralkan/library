import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class TransactionContextService {
  private readonly storage = new AsyncLocalStorage<EntityManager>();

  constructor(
    @InjectDataSource('postgres') private readonly dataSource: DataSource,
  ) {}

  getManager(): EntityManager | undefined {
    return this.storage.getStore();
  }

  getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): Repository<Entity> {
    const manager = this.getManager();
    if (manager) {
      return manager.getRepository(entity);
    }
    return this.dataSource.getRepository(entity);
  }

  async runInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const existingManager = this.getManager();
    if (existingManager) {
      return operation();
    }

    return this.dataSource.transaction(async (manager) =>
      this.storage.run(manager, operation),
    );
  }
}
