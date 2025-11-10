import { injectable } from 'inversify';
import JZZ from 'jzz';
import { IMidiInputService, MidiDeviceInfo, MidiInputHandler } from '@domain/services/IMidiInputService';
import { MidiMessage } from '@domain/entities/MidiMessage';
import { Result, success, failure } from '@shared/types/Result';

/**
 * MIDI Adapter using JZZ (pure JavaScript, no native compilation needed)
 * Implements IMidiInputService
 */
@injectable()
export class EasyMidiAdapter implements IMidiInputService {
  private inputs: Map<string, any> = new Map();
  private handlers: Set<MidiInputHandler> = new Set();
  private jzzInitialized = false;

  async getDevices(): Promise<Result<MidiDeviceInfo[]>> {
    try {
      await this.ensureInitialized();
      
      // Force JZZ to refresh the list of MIDI devices
      await JZZ().refresh();
      
      const info = await JZZ().info();
      const devices: MidiDeviceInfo[] = info.inputs.map((input: any, index: number) => ({
        name: input.name,
        id: index.toString()
      }));

      return success(devices);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to get MIDI devices: ${errorMessage}`));
    }
  }

  async openDevice(deviceName: string): Promise<Result<void>> {
    try {
      await this.ensureInitialized();

      console.log(`=== MIDI ADAPTER: Opening device "${deviceName}" ===`);

      // Special case: open all devices
      if (deviceName === 'all') {
        const devicesResult = await this.getDevices();
        if (devicesResult.isFailure()) {
          return failure(devicesResult.error);
        }

        console.log(`=== MIDI ADAPTER: Opening all ${devicesResult.value.length} devices ===`);

        // Open all available devices
        for (const device of devicesResult.value) {
          await this.openSingleDevice(device.name);
        }

        console.log(`Opened all MIDI devices (${devicesResult.value.length} devices)`);
        return success(undefined);
      }

      // Open a single device
      return await this.openSingleDevice(deviceName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`=== MIDI ADAPTER: Failed to open device "${deviceName}" ===`, errorMessage);
      return failure(new Error(`Failed to open MIDI device: ${errorMessage}`));
    }
  }

  private async openSingleDevice(deviceName: string): Promise<Result<void>> {
    try {
      // Close device if already open
      if (this.inputs.has(deviceName)) {
        this.closeSingleDevice(deviceName);
      }

      // Open the device
      const input = await JZZ().openMidiIn(deviceName);
      
      // Set up message handler
      input.connect((msg: any) => {
        this.handleMidiMessage(msg, deviceName);
      });

      this.inputs.set(deviceName, input);
      console.log(`MIDI device opened: ${deviceName}`);
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to open MIDI device ${deviceName}: ${errorMessage}`));
    }
  }

  closeDevice(deviceName?: string): Result<void> {
    try {
      if (deviceName) {
        this.closeSingleDevice(deviceName);
      } else {
        // Close all devices
        for (const name of this.inputs.keys()) {
          this.closeSingleDevice(name);
        }
      }

      console.log(deviceName ? `MIDI device closed: ${deviceName}` : 'All MIDI devices closed');
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to close MIDI device: ${errorMessage}`));
    }
  }

  private closeSingleDevice(deviceName: string): void {
    const input = this.inputs.get(deviceName);
    if (input) {
      input.close();
      this.inputs.delete(deviceName);
    }
  }

  getCurrentDevices(): string[] {
    return Array.from(this.inputs.keys());
  }

  isDeviceOpen(): boolean {
    return this.inputs.size > 0;
  }

  onMessage(handler: MidiInputHandler): void {
    this.handlers.add(handler);
    console.log(`=== MIDI ADAPTER: Handler added, total handlers: ${this.handlers.size} ===`);
  }

  offMessage(handler: MidiInputHandler): void {
    this.handlers.delete(handler);
    console.log(`=== MIDI ADAPTER: Handler removed, total handlers: ${this.handlers.size} ===`);
  }

  removeAllHandlers(): void {
    this.handlers.clear();
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.jzzInitialized) {
      await JZZ();
      this.jzzInitialized = true;
    }
  }

  private handleMidiMessage(msg: any, sourceDevice: string): void {
    const data = msg.slice();
    if (data.length < 2) return;

    const status = data[0];
    const type = status & 0xf0;
    const channel = (status & 0x0f) + 1; // Convert 0-15 to 1-16

    let midiMessage: MidiMessage | null = null;

    switch (type) {
      case 0x90: // Note On
        if (data[2] > 0) {
          midiMessage = MidiMessage.note(data[1], data[2], channel);
        } else {
          // Note on with velocity 0 = note off
          midiMessage = MidiMessage.note(data[1], 0, channel);
        }
        break;

      case 0x80: // Note Off
        midiMessage = MidiMessage.note(data[1], 0, channel);
        break;

      case 0xb0: // Control Change
        midiMessage = MidiMessage.cc(data[1], data[2], channel);
        break;

      case 0xc0: // Program Change
        midiMessage = MidiMessage.programChange(data[1], channel);
        break;
    }

    if (midiMessage) {
      this.notifyHandlers(midiMessage, sourceDevice);
    }
  }

  private notifyHandlers(message: MidiMessage, sourceDevice: string): void {
    console.log(`=== MIDI ADAPTER: Notifying ${this.handlers.size} handlers ===`, {
      message: MidiMessage.toString(message),
      sourceDevice
    });
    
    this.handlers.forEach(handler => {
      try {
        handler(message, sourceDevice);
      } catch (error) {
        console.error('Error in MIDI handler:', error);
      }
    });
  }
}

