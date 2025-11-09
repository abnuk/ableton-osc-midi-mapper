/**
 * Config DTOs
 */

export interface ConfigDTO {
  selectedMidiDevice: string | null;
  selectedMidiChannel: number | 'all';
  oscHost: string;
  oscPort: number;
  autoReconnect: boolean;
  lastOpened: string;
}

export interface UpdateConfigInput {
  selectedMidiDevice?: string | null;
  selectedMidiChannel?: number | 'all';
  oscHost?: string;
  oscPort?: number;
  autoReconnect?: boolean;
}

