import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IMidiInputService } from '@domain/services/IMidiInputService';
import { Result, success, failure } from '@shared/types/Result';
import { GetMidiDevicesOutput, MidiDeviceDTO } from '../dtos/MidiDTOs';

/**
 * GetMidiDevices Use Case
 * Retrieves list of available MIDI devices
 */
@injectable()
export class GetMidiDevices {
  constructor(
    @inject(TYPES.MidiInputService) private readonly midiService: IMidiInputService
  ) {}

  async execute(): Promise<Result<GetMidiDevicesOutput, string>> {
    try {
      const devicesResult = await this.midiService.getDevices();

      if (devicesResult.isFailure()) {
        return failure(`Failed to get MIDI devices: ${devicesResult.error.message}`);
      }

      // Add "All Devices" option at the beginning
      const devicesWithAll: MidiDeviceDTO[] = [
        { name: 'All Devices', id: 'all' },
        ...devicesResult.value.map(d => ({ name: d.name, id: d.id }))
      ];

      const currentDevices = this.midiService.getCurrentDevices();

      console.log('=== GET MIDI DEVICES ===', {
        availableDevices: devicesWithAll.length,
        currentDevices: currentDevices
      });

      return success({
        devices: devicesWithAll,
        currentDevices: currentDevices
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to get MIDI devices: ${errorMessage}`);
    }
  }
}

