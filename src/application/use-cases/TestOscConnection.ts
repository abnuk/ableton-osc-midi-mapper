import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IOscOutputService } from '@domain/services/IOscOutputService';
import { Result, success, failure } from '@shared/types/Result';

/**
 * TestOscConnection Use Case
 * Tests the OSC connection to Ableton Live
 */
@injectable()
export class TestOscConnection {
  constructor(
    @inject(TYPES.OscOutputService) private readonly oscService: IOscOutputService
  ) {}

  async execute(): Promise<Result<boolean, string>> {
    try {
      const testResult = await this.oscService.test();

      if (testResult.isFailure()) {
        return failure(`OSC connection test failed: ${testResult.error.message}`);
      }

      return success(testResult.value);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to test OSC connection: ${errorMessage}`);
    }
  }
}

