import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IMidiOutputService } from '@domain/services/IMidiOutputService';
import { IConfigRepository } from '@domain/repositories/IConfigRepository';
import { Result, success, failure } from '@shared/types/Result';

export interface SelectMidiOutputDeviceInput {
  deviceName: string;
}

/**
 * SelectMidiOutputDevice Use Case
 * Selects and opens a MIDI output device for pass-through
 */
@injectable()
export class SelectMidiOutputDevice {
  constructor(
    @inject(TYPES.MidiOutputService) private readonly midiOutputService: IMidiOutputService,
    @inject(TYPES.ConfigRepository) private readonly configRepository: IConfigRepository
  ) {}

  async execute(input: SelectMidiOutputDeviceInput): Promise<Result<void, string>> {
    try {
      // Close current device if open
      if (this.midiOutputService.isOutputDeviceOpen()) {
        const closeResult = this.midiOutputService.closeOutputDevice();
        if (closeResult.isFailure()) {
          return failure(`Failed to close current output device: ${closeResult.error.message}`);
        }
      }

      // If deviceName is empty, just disconnect (don't open any device)
      if (!input.deviceName) {
        // Clear saved device from config and disable pass-through
        await this.configRepository.setValue('midiPassthroughDevice', null);
        await this.configRepository.setValue('midiPassthroughEnabled', false);
        return success(undefined);
      }

      // Open new device
      const openResult = await this.midiOutputService.openOutputDevice(input.deviceName);

      if (openResult.isFailure()) {
        return failure(`Failed to open output device: ${openResult.error.message}`);
      }

      // Save to config
      await this.configRepository.setValue('midiPassthroughDevice', input.deviceName);

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to select MIDI output device: ${errorMessage}`);
    }
  }
}

