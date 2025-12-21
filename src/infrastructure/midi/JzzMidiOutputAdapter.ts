import { injectable } from 'inversify';
import JZZ from 'jzz';
import { IMidiOutputService, MidiOutputDeviceInfo } from '@domain/services/IMidiOutputService';
import { MidiMessage } from '@domain/entities/MidiMessage';
import { Result, success, failure } from '@shared/types/Result';

/**
 * MIDI Output Adapter using JZZ (pure JavaScript, no native compilation needed)
 * Implements IMidiOutputService for sending MIDI messages to output devices
 */
@injectable()
export class JzzMidiOutputAdapter implements IMidiOutputService {
  private output: any = null;
  private currentDeviceName: string | null = null;
  private jzzInitialized = false;

  async getOutputDevices(): Promise<Result<MidiOutputDeviceInfo[]>> {
    try {
      await this.ensureInitialized();
      
      // Force JZZ to refresh the list of MIDI devices
      await JZZ().refresh();
      
      const info = await JZZ().info();
      const devices: MidiOutputDeviceInfo[] = info.outputs.map((output: any, index: number) => ({
        name: output.name,
        id: index.toString()
      }));

      return success(devices);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to get MIDI output devices: ${errorMessage}`));
    }
  }

  async openOutputDevice(deviceName: string): Promise<Result<void>> {
    try {
      await this.ensureInitialized();

      console.log(`=== MIDI OUTPUT ADAPTER: Opening output device "${deviceName}" ===`);

      // Close current device if open
      if (this.output) {
        this.closeOutputDevice();
      }

      // Open the device
      this.output = await JZZ().openMidiOut(deviceName);
      this.currentDeviceName = deviceName;

      console.log(`MIDI output device opened: ${deviceName}`);
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`=== MIDI OUTPUT ADAPTER: Failed to open device "${deviceName}" ===`, errorMessage);
      return failure(new Error(`Failed to open MIDI output device: ${errorMessage}`));
    }
  }

  closeOutputDevice(): Result<void> {
    try {
      if (this.output) {
        this.output.close();
        this.output = null;
        console.log(`MIDI output device closed: ${this.currentDeviceName}`);
        this.currentDeviceName = null;
      }
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to close MIDI output device: ${errorMessage}`));
    }
  }

  getCurrentOutputDevice(): string | null {
    return this.currentDeviceName;
  }

  isOutputDeviceOpen(): boolean {
    return this.output !== null;
  }

  sendMessage(message: MidiMessage): Result<void> {
    if (!this.output) {
      return failure(new Error('No MIDI output device is open'));
    }

    try {
      const data = this.midiMessageToBytes(message);
      this.output.send(data);
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to send MIDI message: ${errorMessage}`));
    }
  }

  sendRawMessage(data: number[]): Result<void> {
    if (!this.output) {
      return failure(new Error('No MIDI output device is open'));
    }

    try {
      this.output.send(data);
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to send raw MIDI message: ${errorMessage}`));
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.jzzInitialized) {
      await JZZ();
      this.jzzInitialized = true;
    }
  }

  /**
   * Convert MidiMessage to raw MIDI bytes
   */
  private midiMessageToBytes(message: MidiMessage): number[] {
    const data = message.data.toJSON();
    const channel = (data.channel ?? 1) - 1; // Convert 1-16 to 0-15

    switch (message.type) {
      case 'note':
        // Note On (velocity > 0) or Note Off (velocity = 0)
        const velocity = data.velocity ?? 0;
        const status = velocity > 0 ? 0x90 : 0x80;
        return [status | channel, data.note ?? 0, velocity];

      case 'cc':
        // Control Change
        return [0xb0 | channel, data.controller ?? 0, data.value ?? 0];

      case 'program_change':
        // Program Change
        return [0xc0 | channel, data.program ?? 0];

      default:
        return [];
    }
  }
}

