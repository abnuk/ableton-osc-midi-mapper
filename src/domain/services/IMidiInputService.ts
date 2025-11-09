import { MidiMessage } from '../entities/MidiMessage';
import { Result } from '@shared/types/Result';

/**
 * MIDI Device Info
 */
export interface MidiDeviceInfo {
  name: string;
  id: string;
}

/**
 * MIDI Input Event Handler with source device information
 */
export type MidiInputHandler = (message: MidiMessage, sourceDevice: string) => void;

/**
 * MIDI Input Service Interface
 * Manages MIDI device connections and input handling
 */
export interface IMidiInputService {
  /**
   * Get list of available MIDI input devices
   */
  getDevices(): Promise<Result<MidiDeviceInfo[]>> | Result<MidiDeviceInfo[]>;

  /**
   * Open a MIDI device for input
   * Pass 'all' to open all available devices
   */
  openDevice(deviceName: string): Promise<Result<void>> | Result<void>;

  /**
   * Close a specific device or all devices
   */
  closeDevice(deviceName?: string): Result<void>;

  /**
   * Get list of currently connected devices
   */
  getCurrentDevices(): string[];

  /**
   * Check if any device is currently open
   */
  isDeviceOpen(): boolean;

  /**
   * Register a handler for MIDI input messages
   */
  onMessage(handler: MidiInputHandler): void;

  /**
   * Remove a message handler
   */
  offMessage(handler: MidiInputHandler): void;

  /**
   * Remove all message handlers
   */
  removeAllHandlers(): void;
}

