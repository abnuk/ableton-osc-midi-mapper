import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IMidiOutputService, MidiOutputDeviceInfo } from '@domain/services/IMidiOutputService';
import { Result, success, failure } from '@shared/types/Result';

export interface GetMidiOutputDevicesOutput {
  devices: MidiOutputDeviceInfo[];
  currentDevice: string | null;
}

/**
 * GetMidiOutputDevices Use Case
 * Retrieves list of available MIDI output devices
 */
@injectable()
export class GetMidiOutputDevices {
  constructor(
    @inject(TYPES.MidiOutputService) private readonly midiOutputService: IMidiOutputService
  ) {}

  async execute(): Promise<Result<GetMidiOutputDevicesOutput, string>> {
    try {
      const devicesResult = await this.midiOutputService.getOutputDevices();

      if (devicesResult.isFailure()) {
        return failure(`Failed to get MIDI output devices: ${devicesResult.error.message}`);
      }

      const currentDevice = this.midiOutputService.getCurrentOutputDevice();

      console.log('=== GET MIDI OUTPUT DEVICES ===', {
        availableDevices: devicesResult.value.length,
        currentDevice
      });

      return success({
        devices: devicesResult.value,
        currentDevice
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to get MIDI output devices: ${errorMessage}`);
    }
  }
}

