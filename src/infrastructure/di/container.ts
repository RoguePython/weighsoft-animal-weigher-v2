/**
 * Dependency Injection Container
 * 
 * Manages dependencies and provides singleton instances.
 */

import { SqliteAnimalGroupRepository } from '@/data/repositories/sqlite-animal-group.repository';
import { SqliteBatchRepository } from '@/data/repositories/sqlite-batch.repository';
import { SqliteCustomFieldListRepository } from '@/data/repositories/sqlite-custom-field-list.repository';
import { SqliteEntityRepository } from '@/data/repositories/sqlite-entity.repository';
import { SqliteTransactionRepository } from '@/data/repositories/sqlite-transaction.repository';
import { IAnimalGroupRepository } from '@/domain/repositories/animal-group.repository';
import { IBatchRepository } from '@/domain/repositories/batch.repository';
import { ICustomFieldListRepository } from '@/domain/repositories/custom-field-list.repository';
import { IEntityRepository } from '@/domain/repositories/entity.repository';
import { ITransactionRepository } from '@/domain/repositories/transaction.repository';
import { DatabaseManager } from '../database/database-manager';

class DIContainer {
  private static instance: DIContainer;
  private _database: DatabaseManager | null = null;
  private _repositories: Map<string, any> = new Map();
  private _initialized = false;
  private _initializationPromise: Promise<void> | null = null;
  private _initializationError: Error | null = null;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this._initialized && this._database?.isInitialized) {
      return;
    }

    // If initialization is in progress, wait for it
    if (this._initializationPromise) {
      return this._initializationPromise;
    }

    // Start new initialization
    this._initializationPromise = (async () => {
      try {
        // Create database manager (this handles its own initialization)
        this._database = await DatabaseManager.create();
        
        // Verify database is actually ready
        if (!this._database.isInitialized) {
          throw new Error('Database manager created but not initialized');
        }

        // Verify we can actually use the database
        await this._database.database.execAsync('SELECT 1');
        
        this._initialized = true;
        this._initializationError = null;
      } catch (error) {
        this._initialized = false;
        this._initializationError = error instanceof Error ? error : new Error(String(error));
        this._database = null;
        throw this._initializationError;
      } finally {
        this._initializationPromise = null;
      }
    })();

    return this._initializationPromise;
  }

  get isInitialized(): boolean {
    return this._initialized && this._database !== null && this._database.isInitialized;
  }

  get initializationError(): Error | null {
    return this._initializationError || this._database?.initializationError || null;
  }

  get database(): DatabaseManager {
    if (!this._database) {
      throw new Error('Container not initialized. Call initialize() first.');
    }
    return this._database;
  }

  get entityRepository(): IEntityRepository {
    if (!this._repositories.has('entity')) {
      this._repositories.set(
        'entity',
        new SqliteEntityRepository(this.database.database)
      );
    }
    return this._repositories.get('entity');
  }

  get transactionRepository(): ITransactionRepository {
    if (!this._repositories.has('transaction')) {
      this._repositories.set(
        'transaction',
        new SqliteTransactionRepository(this.database.database)
      );
    }
    return this._repositories.get('transaction');
  }

  get batchRepository(): IBatchRepository {
    if (!this._repositories.has('batch')) {
      this._repositories.set(
        'batch',
        new SqliteBatchRepository(this.database.database)
      );
    }
    return this._repositories.get('batch');
  }

  get customFieldListRepository(): ICustomFieldListRepository {
    if (!this._repositories.has('cfl')) {
      this._repositories.set(
        'cfl',
        new SqliteCustomFieldListRepository(this.database.database)
      );
    }
    return this._repositories.get('cfl');
  }

  get animalGroupRepository(): IAnimalGroupRepository {
    if (!this._repositories.has('animalGroup')) {
      this._repositories.set(
        'animalGroup',
        new SqliteAnimalGroupRepository(this.database.database)
      );
    }
    return this._repositories.get('animalGroup');
  }

  // For testing - reset container
  reset(): void {
    this._repositories.clear();
    this._database = null;
    this._initialized = false;
  }
}

export const container = DIContainer.getInstance();

