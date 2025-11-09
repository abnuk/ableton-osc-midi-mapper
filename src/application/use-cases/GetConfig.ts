import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IConfigRepository } from '@domain/repositories/IConfigRepository';
import { Result, success, failure } from '@shared/types/Result';
import { ConfigDTO } from '../dtos/ConfigDTOs';

/**
 * GetConfig Use Case
 * Retrieves application configuration
 */
@injectable()
export class GetConfig {
  constructor(
    @inject(TYPES.ConfigRepository) private readonly configRepository: IConfigRepository
  ) {}

  async execute(): Promise<Result<ConfigDTO, string>> {
    try {
      const configResult = await this.configRepository.get();

      if (configResult.isFailure()) {
        return failure(`Failed to get config: ${configResult.error.message}`);
      }

      return success(configResult.value);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to get config: ${errorMessage}`);
    }
  }
}

