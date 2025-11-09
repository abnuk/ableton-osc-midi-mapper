import { MidiNote } from '../value-objects/MidiNote';
import { MidiCC } from '../value-objects/MidiCC';
import { MidiProgramChange } from '../value-objects/MidiProgramChange';

/**
 * MIDI Message Types
 */
export enum MidiMessageType {
  NOTE = 'note',
  CC = 'cc',
  PROGRAM_CHANGE = 'program_change'
}

/**
 * MIDI Message Entity
 * Discriminated union representing different types of MIDI messages
 */
export type MidiMessage =
  | { type: MidiMessageType.NOTE; data: MidiNote }
  | { type: MidiMessageType.CC; data: MidiCC }
  | { type: MidiMessageType.PROGRAM_CHANGE; data: MidiProgramChange };

/**
 * Factory functions for creating MIDI messages
 */
export const MidiMessage = {
  note(note: number, velocity: number, channel: number): MidiMessage {
    return {
      type: MidiMessageType.NOTE,
      data: MidiNote.create(note, velocity, channel)
    };
  },

  cc(controller: number, value: number, channel: number): MidiMessage {
    return {
      type: MidiMessageType.CC,
      data: MidiCC.create(controller, value, channel)
    };
  },

  programChange(program: number, channel: number): MidiMessage {
    return {
      type: MidiMessageType.PROGRAM_CHANGE,
      data: MidiProgramChange.create(program, channel)
    };
  },

  toString(message: MidiMessage): string {
    switch (message.type) {
      case MidiMessageType.NOTE:
        return `Note: ${message.data.toString()}`;
      case MidiMessageType.CC:
        return `CC: ${message.data.toString()}`;
      case MidiMessageType.PROGRAM_CHANGE:
        return `PC: ${message.data.toString()}`;
    }
  },

  getChannel(message: MidiMessage): number {
    return message.data.channel;
  }
};

