import { injectable } from 'inversify';
import Store from 'electron-store';
import { z } from 'zod';
import { IMappingRepository } from '@domain/repositories/IMappingRepository';
import { Mapping } from '@domain/entities/Mapping';
import { MidiChannel } from '@domain/value-objects/MidiChannel';
import { OscCommand } from '@domain/entities/OscCommand';
import { Result, success, failure } from '@shared/types/Result';

/**
 * Serialized mapping format for persistence
 */
interface SerializedMapping {
  id: string;
  name: string;
  trigger: any;
  command: {
    address: string;
    parameters: Array<number | string | boolean>;
  };
  parameterMappings: any[];
  enabled: boolean;
}

/**
 * In-Memory Mapping Repository with Persistence
 * Uses electron-store for persistence and keeps mappings in memory
 */
@injectable()
export class InMemoryMappingRepository implements IMappingRepository {
  private mappings: Map<string, Mapping> = new Map();
  private store: Store<{ mappings: SerializedMapping[] }>;

  constructor() {
    this.store = new Store<{ mappings: SerializedMapping[] }>({
      defaults: {
        mappings: []
      }
    });

    // Load mappings from store
    this.loadFromStore();
  }

  async getAll(): Promise<Result<Mapping[]>> {
    try {
      return success(Array.from(this.mappings.values()));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to get all mappings: ${errorMessage}`));
    }
  }

  async getById(id: string): Promise<Result<Mapping | null>> {
    try {
      const mapping = this.mappings.get(id) || null;
      return success(mapping);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to get mapping by ID: ${errorMessage}`));
    }
  }

  async save(mapping: Mapping): Promise<Result<void>> {
    try {
      this.mappings.set(mapping.id, mapping);
      await this.persistToStore();
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to save mapping: ${errorMessage}`));
    }
  }

  async update(mapping: Mapping): Promise<Result<void>> {
    try {
      if (!this.mappings.has(mapping.id)) {
        return failure(new Error(`Mapping with ID ${mapping.id} not found`));
      }

      this.mappings.set(mapping.id, mapping);
      await this.persistToStore();
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to update mapping: ${errorMessage}`));
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      if (!this.mappings.has(id)) {
        return failure(new Error(`Mapping with ID ${id} not found`));
      }

      this.mappings.delete(id);
      await this.persistToStore();
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to delete mapping: ${errorMessage}`));
    }
  }

  async clear(): Promise<Result<void>> {
    try {
      this.mappings.clear();
      await this.persistToStore();
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to clear mappings: ${errorMessage}`));
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      return success(this.mappings.has(id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to check mapping existence: ${errorMessage}`));
    }
  }

  private loadFromStore(): void {
    try {
      const serializedMappings = this.store.get('mappings', []);

      for (const serialized of serializedMappings) {
        try {
          const mapping = this.deserializeMapping(serialized);
          this.mappings.set(mapping.id, mapping);
        } catch (error) {
          console.error(`Failed to load mapping ${serialized.id}:`, error);
        }
      }

      console.log(`Loaded ${this.mappings.size} mappings from store`);
    } catch (error) {
      console.error('Failed to load mappings from store:', error);
    }
  }

  private async persistToStore(): Promise<void> {
    try {
      const serializedMappings: SerializedMapping[] = Array.from(this.mappings.values()).map(
        mapping => this.serializeMapping(mapping)
      );

      this.store.set('mappings', serializedMappings);
    } catch (error) {
      console.error('Failed to persist mappings to store:', error);
      throw error;
    }
  }

  private serializeMapping(mapping: Mapping): SerializedMapping {
    return {
      id: mapping.id,
      name: mapping.name,
      trigger: {
        ...mapping.trigger,
        channel: mapping.trigger.channel.toJSON()
      },
      command: mapping.command.toJSON(),
      parameterMappings: [...mapping.parameterMappings],
      enabled: mapping.enabled
    };
  }

  private deserializeMapping(serialized: SerializedMapping): Mapping {
    const channel = MidiChannel.fromValue(serialized.trigger.channel);
    const trigger = { ...serialized.trigger, channel };
    const command = OscCommand.create(serialized.command.address, serialized.command.parameters);

    return Mapping.create(
      serialized.id,
      serialized.name,
      trigger,
      command,
      serialized.parameterMappings,
      serialized.enabled
    );
  }
}

