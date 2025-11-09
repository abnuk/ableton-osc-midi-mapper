import { Mapping } from '../entities/Mapping';
import { Result } from '@shared/types/Result';

/**
 * Mapping Repository Interface
 * Manages persistence and retrieval of MIDI → OSC mappings
 */
export interface IMappingRepository {
  /**
   * Get all mappings
   */
  getAll(): Promise<Result<Mapping[]>>;

  /**
   * Get a mapping by ID
   */
  getById(id: string): Promise<Result<Mapping | null>>;

  /**
   * Save a new mapping
   */
  save(mapping: Mapping): Promise<Result<void>>;

  /**
   * Update an existing mapping
   */
  update(mapping: Mapping): Promise<Result<void>>;

  /**
   * Delete a mapping by ID
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * Delete all mappings
   */
  clear(): Promise<Result<void>>;

  /**
   * Check if a mapping exists
   */
  exists(id: string): Promise<Result<boolean>>;
}

