import { OscCommand } from '../entities/OscCommand';
import { Result } from '@shared/types/Result';

/**
 * OSC Connection Status
 */
export enum OscConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

/**
 * OSC Output Service Interface
 * Manages OSC message sending to Ableton Live
 */
export interface IOscOutputService {
  /**
   * Connect to OSC server
   */
  connect(host: string, port: number): Result<void>;

  /**
   * Disconnect from OSC server
   */
  disconnect(): Result<void>;

  /**
   * Send an OSC command
   */
  send(command: OscCommand): Result<void>;

  /**
   * Check if connected
   */
  isConnected(): boolean;

  /**
   * Get connection status
   */
  getStatus(): OscConnectionStatus;

  /**
   * Test connection by sending a test message
   */
  test(): Promise<Result<boolean>>;
}

