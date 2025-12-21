import { MidiMessage } from '../entities/MidiMessage';
import { Result } from '@shared/types/Result';

/**
 * MIDI Output Device Info
 */
export interface MidiOutputDeviceInfo {
  name: string;
  id: string;
}

/**
 * MIDI Output Service Interface
 * Manages MIDI output device connections and message sending
 */
export interface IMidiOutputService {
  /**
   * Get list of available MIDI output devices
   */
  getOutputDevices(): Promise<Result<MidiOutputDeviceInfo[]>>;

  /**
   * Open a MIDI device for output
   */
  openOutputDevice(deviceName: string): Promise<Result<void>>;

  /**
   * Close the current output device
   */
  closeOutputDevice(): Result<void>;

  /**
   * Get the currently connected output device name
   */
  getCurrentOutputDevice(): string | null;

  /**
   * Check if an output device is currently open
   */
  isOutputDeviceOpen(): boolean;

  /**
   * Send a MIDI message to the output device
   */
  sendMessage(message: MidiMessage): Result<void>;

  /**
   * Send raw MIDI bytes to the output device
   */
  sendRawMessage(data: number[]): Result<void>;
}

