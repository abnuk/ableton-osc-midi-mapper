import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IMappingRepository } from '@domain/repositories/IMappingRepository';
import { Result, success, failure } from '@shared/types/Result';
import { DeleteMappingInput } from '../dtos/MappingDTOs';

/**
 * DeleteMapping Use Case
 * Deletes a mapping by ID
 */
@injectable()
export class DeleteMapping {
  constructor(
    @inject(TYPES.MappingRepository) private readonly mappingRepository: IMappingRepository
  ) {}

  async execute(input: DeleteMappingInput): Promise<Result<void, string>> {
    try {
      // Check if mapping exists
      const existsResult = await this.mappingRepository.exists(input.mappingId);
      
      if (existsResult.isFailure()) {
        return failure(`Failed to check mapping existence: ${existsResult.error.message}`);
      }

      if (!existsResult.value) {
        return failure(`Mapping with ID ${input.mappingId} not found`);
      }

      // Delete the mapping
      const deleteResult = await this.mappingRepository.delete(input.mappingId);

      if (deleteResult.isFailure()) {
        return failure(`Failed to delete mapping: ${deleteResult.error.message}`);
      }

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to delete mapping: ${errorMessage}`);
    }
  }
}

