import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IConfigRepository } from '@domain/repositories/IConfigRepository';
import { Result, success, failure } from '@shared/types/Result';
import { UpdateConfigInput } from '../dtos/ConfigDTOs';

/**
 * UpdateConfig Use Case
 * Updates application configuration
 */
@injectable()
export class UpdateConfig {
  constructor(
    @inject(TYPES.ConfigRepository) private readonly configRepository: IConfigRepository
  ) {}

  async execute(input: UpdateConfigInput): Promise<Result<void, string>> {
    try {
      const updateResult = await this.configRepository.update(input);

      if (updateResult.isFailure()) {
        return failure(`Failed to update config: ${updateResult.error.message}`);
      }

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to update config: ${errorMessage}`);
    }
  }
}

