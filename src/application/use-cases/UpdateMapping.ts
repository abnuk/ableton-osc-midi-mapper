import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IMappingRepository } from '@domain/repositories/IMappingRepository';
import { Result, success, failure } from '@shared/types/Result';
import { UpdateMappingInput } from '../dtos/MappingDTOs';

/**
 * UpdateMapping Use Case
 * Updates an existing mapping
 */
@injectable()
export class UpdateMapping {
  constructor(
    @inject(TYPES.MappingRepository) private readonly mappingRepository: IMappingRepository
  ) {}

  async execute(input: UpdateMappingInput): Promise<Result<void, string>> {
    try {
      // Get existing mapping
      const getResult = await this.mappingRepository.getById(input.mappingId);

      if (getResult.isFailure()) {
        return failure(`Failed to get mapping: ${getResult.error.message}`);
      }

      if (!getResult.value) {
        return failure(`Mapping with ID ${input.mappingId} not found`);
      }

      let mapping = getResult.value;

      // Apply updates
      if (input.name !== undefined) {
        mapping = mapping.withName(input.name);
      }

      if (input.enabled !== undefined) {
        mapping = mapping.withEnabled(input.enabled);
      }

      // Save updated mapping
      const updateResult = await this.mappingRepository.update(mapping);

      if (updateResult.isFailure()) {
        return failure(`Failed to update mapping: ${updateResult.error.message}`);
      }

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to update mapping: ${errorMessage}`);
    }
  }
}

