import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IConfigRepository } from '@domain/repositories/IConfigRepository';
import { IMidiOutputService } from '@domain/services/IMidiOutputService';
import { Result, success, failure } from '@shared/types/Result';

export interface SetMidiPassthroughInput {
  enabled: boolean;
}

export interface GetMidiPassthroughOutput {
  enabled: boolean;
  deviceName: string | null;
}

/**
 * SetMidiPassthrough Use Case
 * Enables or disables MIDI pass-through
 */
@injectable()
export class SetMidiPassthrough {
  constructor(
    @inject(TYPES.ConfigRepository) private readonly configRepository: IConfigRepository,
    @inject(TYPES.MidiOutputService) private readonly midiOutputService: IMidiOutputService
  ) {}

  async execute(input: SetMidiPassthroughInput): Promise<Result<void, string>> {
    try {
      // If enabling, check if output device is configured
      if (input.enabled) {
        const deviceResult = await this.configRepository.getValue('midiPassthroughDevice');
        if (deviceResult.isFailure() || !deviceResult.value) {
          return failure('No MIDI output device configured. Please select an output device first.');
        }

        // Make sure the device is open
        if (!this.midiOutputService.isOutputDeviceOpen()) {
          const openResult = await this.midiOutputService.openOutputDevice(deviceResult.value);
          if (openResult.isFailure()) {
            return failure(`Failed to open MIDI output device: ${openResult.error.message}`);
          }
        }
      }

      await this.configRepository.setValue('midiPassthroughEnabled', input.enabled);
      console.log(`MIDI Pass-through ${input.enabled ? 'enabled' : 'disabled'}`);
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to set MIDI pass-through: ${errorMessage}`);
    }
  }

  async getStatus(): Promise<Result<GetMidiPassthroughOutput, string>> {
    try {
      const enabledResult = await this.configRepository.getValue('midiPassthroughEnabled');
      const deviceResult = await this.configRepository.getValue('midiPassthroughDevice');

      return success({
        enabled: enabledResult.isSuccess() ? enabledResult.value : false,
        deviceName: deviceResult.isSuccess() ? deviceResult.value : null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to get MIDI pass-through status: ${errorMessage}`);
    }
  }
}

