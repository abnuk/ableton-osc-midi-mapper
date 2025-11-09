/**
 * MIDI DTOs
 */

export interface MidiDeviceDTO {
  name: string;
  id: string;
}

export interface SelectMidiDeviceInput {
  deviceName: string;
}

export interface GetMidiDevicesOutput {
  devices: MidiDeviceDTO[];
  currentDevices: string[];  // Changed from currentDevice to support multiple devices
}

