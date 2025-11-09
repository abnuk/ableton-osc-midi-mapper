import { injectable } from 'inversify';
import * as osc from 'osc';
import { IOscOutputService, OscConnectionStatus } from '@domain/services/IOscOutputService';
import { OscCommand } from '@domain/entities/OscCommand';
import { Result, success, failure } from '@shared/types/Result';

/**
 * OSC Adapter using osc library
 * Implements IOscOutputService
 * Sends OSC messages to Ableton Live (one-way communication)
 */
@injectable()
export class NodeOscAdapter implements IOscOutputService {
  private udpPort: any = null;
  private status: OscConnectionStatus = OscConnectionStatus.DISCONNECTED;
  private host: string = '127.0.0.1';
  private port: number = 11000;

  connect(host: string, port: number): Result<void> {
    try {
      this.host = host;
      this.port = port;

      // Create UDP port for sending OSC messages
      this.udpPort = new osc.UDPPort({
        localAddress: '0.0.0.0',
        localPort: 0, // Use any available port
        metadata: true
      });

      this.udpPort.open();

      this.udpPort.on('ready', () => {
        this.status = OscConnectionStatus.CONNECTED;
        console.log(`OSC connected to ${this.host}:${this.port}`);
      });

      this.udpPort.on('error', (err: Error) => {
        console.error('OSC Error:', err);
        this.status = OscConnectionStatus.ERROR;
      });

      return success(undefined);
    } catch (error) {
      this.status = OscConnectionStatus.ERROR;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to connect to OSC: ${errorMessage}`));
    }
  }

  disconnect(): Result<void> {
    try {
      if (this.udpPort) {
        this.udpPort.close();
        this.udpPort = null;
      }
      this.status = OscConnectionStatus.DISCONNECTED;
      console.log('OSC disconnected');
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to disconnect from OSC: ${errorMessage}`));
    }
  }

  send(command: OscCommand): Result<void> {
    try {
      if (!this.udpPort) {
        return failure(new Error('OSC client not connected'));
      }

      // Convert parameters to OSC-compatible types
      const args = command.parameters.map(param => {
        if (typeof param === 'boolean') {
          return { type: 'i', value: param ? 1 : 0 };
        } else if (typeof param === 'number') {
          return { type: Number.isInteger(param) ? 'i' : 'f', value: param };
        } else {
          return { type: 's', value: String(param) };
        }
      });

      // Send OSC message
      this.udpPort.send({
        address: command.address.path,
        args
      }, this.host, this.port);

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to send OSC message: ${errorMessage}`));
    }
  }

  isConnected(): boolean {
    return this.status === OscConnectionStatus.CONNECTED && this.udpPort !== null;
  }

  getStatus(): OscConnectionStatus {
    return this.status;
  }

  async test(): Promise<Result<boolean>> {
    try {
      if (!this.isConnected()) {
        return failure(new Error('Not connected to OSC server'));
      }

      // Send test message
      this.udpPort.send({
        address: '/live/test',
        args: []
      }, this.host, this.port);

      // For one-way communication, we assume success if no immediate error
      return success(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`OSC test failed: ${errorMessage}`));
    }
  }
}

