import { injectable } from 'inversify';
import Store from 'electron-store';
import { IConfigRepository, AppConfig } from '@domain/repositories/IConfigRepository';
import { Result, success, failure } from '@shared/types/Result';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AppConfig = {
  selectedMidiDevice: null,
  selectedMidiChannel: 'all',
  oscHost: '127.0.0.1',
  oscPort: 11000,
  autoReconnect: true,
  lastOpened: new Date().toISOString()
};

/**
 * Electron Store Config Repository
 * Implements IConfigRepository using electron-store
 */
@injectable()
export class ElectronStoreConfigRepository implements IConfigRepository {
  private store: Store<AppConfig>;

  constructor() {
    this.store = new Store<AppConfig>({
      defaults: DEFAULT_CONFIG
    });
  }

  async get(): Promise<Result<AppConfig>> {
    try {
      const config = this.store.store;
      return success(config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to get config: ${errorMessage}`));
    }
  }

  async update(config: Partial<AppConfig>): Promise<Result<void>> {
    try {
      // Get current config
      const currentResult = await this.get();
      if (currentResult.isFailure()) {
        return failure(currentResult.error);
      }

      // Merge with updates
      const updatedConfig = { ...currentResult.value, ...config };

      // Save
      this.store.store = updatedConfig;

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to update config: ${errorMessage}`));
    }
  }

  async reset(): Promise<Result<void>> {
    try {
      this.store.clear();
      this.store.store = DEFAULT_CONFIG;
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to reset config: ${errorMessage}`));
    }
  }

  async getValue<K extends keyof AppConfig>(key: K): Promise<Result<AppConfig[K]>> {
    try {
      const value = this.store.get(key);
      return success(value);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to get config value: ${errorMessage}`));
    }
  }

  async setValue<K extends keyof AppConfig>(key: K, value: AppConfig[K]): Promise<Result<void>> {
    try {
      this.store.set(key, value);
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to set config value: ${errorMessage}`));
    }
  }
}

