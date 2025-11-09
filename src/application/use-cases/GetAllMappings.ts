import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IMappingRepository } from '@domain/repositories/IMappingRepository';
import { Mapping } from '@domain/entities/Mapping';
import { Result, success, failure } from '@shared/types/Result';
import { GetAllMappingsOutput, MappingDTO } from '../dtos/MappingDTOs';

/**
 * GetAllMappings Use Case
 * Retrieves all mappings
 */
@injectable()
export class GetAllMappings {
  constructor(
    @inject(TYPES.MappingRepository) private readonly mappingRepository: IMappingRepository
  ) {}

  async execute(): Promise<Result<GetAllMappingsOutput, string>> {
    try {
      const result = await this.mappingRepository.getAll();

      if (result.isFailure()) {
        return failure(`Failed to get mappings: ${result.error.message}`);
      }

      const mappings = result.value.map(mapping => this.mapToDTO(mapping));

      return success({ mappings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to get mappings: ${errorMessage}`);
    }
  }

  private mapToDTO(mapping: Mapping): MappingDTO {
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
}

