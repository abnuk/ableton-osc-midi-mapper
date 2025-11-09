import { Result } from '@shared/types/Result';

/**
 * Application Configuration
 */
export interface AppConfig {
  selectedMidiDevice: string | null;
  selectedMidiChannel: number | 'all';
  oscHost: string;
  oscPort: number;
  autoReconnect: boolean;
  lastOpened: string;
}

/**
 * Configuration Repository Interface
 * Manages application configuration persistence
 */
export interface IConfigRepository {
  /**
   * Get the current configuration
   */
  get(): Promise<Result<AppConfig>>;

  /**
   * Update the configuration (partial update)
   */
  update(config: Partial<AppConfig>): Promise<Result<void>>;

  /**
   * Reset configuration to defaults
   */
  reset(): Promise<Result<void>>;

  /**
   * Get a specific config value
   */
  getValue<K extends keyof AppConfig>(key: K): Promise<Result<AppConfig[K]>>;

  /**
   * Set a specific config value
   */
  setValue<K extends keyof AppConfig>(key: K, value: AppConfig[K]): Promise<Result<void>>;
}

