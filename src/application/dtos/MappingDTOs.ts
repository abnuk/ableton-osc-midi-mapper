/**
 * Mapping DTOs for external communication
 */

import { MidiMessageType } from '@domain/entities/MidiMessage';
import { ParameterMapping } from '@domain/entities/Mapping';

export interface MappingDTO {
  id: string;
  name: string;
  trigger: {
    type: MidiMessageType;
    note?: number;
    controller?: number;
    program?: number;
    channel: number | 'all';
    velocityRange?: [number, number];
    valueRange?: [number, number];
  };
  command: {
    address: string;
    parameters: Array<number | string | boolean>;
  };
  parameterMappings: ParameterMapping[];
  enabled: boolean;
  midiDevice: string | null;  // Device name or null for all devices
}

export interface DeleteMappingInput {
  mappingId: string;
}

export interface UpdateMappingInput {
  mappingId: string;
  name?: string;
  enabled?: boolean;
}

export interface GetAllMappingsOutput {
  mappings: MappingDTO[];
}

