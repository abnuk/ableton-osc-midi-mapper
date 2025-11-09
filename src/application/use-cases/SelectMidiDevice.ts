import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IMidiInputService } from '@domain/services/IMidiInputService';
import { IConfigRepository } from '@domain/repositories/IConfigRepository';
import { Result, success, failure } from '@shared/types/Result';
import { SelectMidiDeviceInput } from '../dtos/MidiDTOs';

/**
 * SelectMidiDevice Use Case
 * Selects and opens a MIDI input device
 */
@injectable()
export class SelectMidiDevice {
  constructor(
    @inject(TYPES.MidiInputService) private readonly midiService: IMidiInputService,
    @inject(TYPES.ConfigRepository) private readonly configRepository: IConfigRepository
  ) {}

  async execute(input: SelectMidiDeviceInput): Promise<Result<void, string>> {
    try {
      // Close current device if open
      if (this.midiService.isDeviceOpen()) {
        const closeResult = this.midiService.closeDevice();
        if (closeResult.isFailure()) {
          return failure(`Failed to close current device: ${closeResult.error.message}`);
        }
      }

      // Open new device
      const openResult = await this.midiService.openDevice(input.deviceName);

      if (openResult.isFailure()) {
        return failure(`Failed to open device: ${openResult.error.message}`);
      }

      // Save to config
      await this.configRepository.setValue('selectedMidiDevice', input.deviceName);

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to select MIDI device: ${errorMessage}`);
    }
  }
}

