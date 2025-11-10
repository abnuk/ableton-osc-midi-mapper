import { MidiMessage, MidiMessageType } from './MidiMessage';
import { OscCommand } from './OscCommand';
import { MidiChannel } from '../value-objects/MidiChannel';

/**
 * Parameter Substitution Strategy
 * Defines how MIDI values map to OSC parameters
 */
export enum ParameterSubstitution {
  NONE = 'none',                    // No substitution
  VELOCITY = 'velocity',            // Use MIDI velocity/value
  VELOCITY_NORMALIZED = 'velocity_normalized',  // Use normalized velocity (0-1)
  TRACK_INDEX = 'track_index',     // Use track index directly
  CLIP_INDEX = 'clip_index',       // Use clip index directly
  SCENE_INDEX = 'scene_index',     // Use scene index directly
  DEVICE_INDEX = 'device_index',   // Use device index directly
  STATIC_VALUE = 'static_value'    // Use a static value
}

/**
 * Parameter Mapping
 * Maps which OSC parameter gets which substitution
 */
export interface ParameterMapping {
  parameterIndex: number;
  substitution: ParameterSubstitution;
  trackIndex?: number; // If substitution is TRACK_INDEX
  clipIndex?: number;  // If substitution is CLIP_INDEX
  sceneIndex?: number; // If substitution is SCENE_INDEX
  deviceIndex?: number; // If substitution is DEVICE_INDEX
  staticValue?: number | string | boolean; // If substitution is STATIC_VALUE
}

/**
 * MIDI Trigger Configuration
 * Defines what MIDI input triggers this mapping
 */
export type MidiTrigger =
  | { type: MidiMessageType.NOTE; note: number; channel: MidiChannel; velocityRange?: [number, number] }
  | { type: MidiMessageType.CC; controller: number; channel: MidiChannel; valueRange?: [number, number] }
  | { type: MidiMessageType.PROGRAM_CHANGE; program: number; channel: MidiChannel };

/**
 * Mapping Entity
 * Links a MIDI trigger to an OSC command with parameter substitutions
 */
export class Mapping {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _trigger: MidiTrigger,
    private readonly _command: OscCommand,
    private readonly _parameterMappings: ReadonlyArray<ParameterMapping>,
    private readonly _enabled: boolean,
    private readonly _midiDevice: string | null  // null = all devices, string = specific device
  ) {}

  static create(
    id: string,
    name: string,
    trigger: MidiTrigger,
    command: OscCommand,
    parameterMappings: ParameterMapping[] = [],
    enabled: boolean = true,
    midiDevice: string | null = null
  ): Mapping {
    return new Mapping(id, name, trigger, command, parameterMappings, enabled, midiDevice);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get trigger(): MidiTrigger {
    return this._trigger;
  }

  get command(): OscCommand {
    return this._command;
  }

  get parameterMappings(): ReadonlyArray<ParameterMapping> {
    return this._parameterMappings;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  get midiDevice(): string | null {
    return this._midiDevice;
  }

  /**
   * Check if a MIDI message matches this mapping's trigger
   * @param message The MIDI message to check
   * @param sourceDevice The name of the MIDI device that sent the message (optional)
   */
  matches(message: MidiMessage, sourceDevice?: string): boolean {
    if (!this._enabled) {
      return false;
    }

    // Check if device matches (null = all devices)
    if (this._midiDevice !== null && sourceDevice !== undefined && this._midiDevice !== sourceDevice) {
      return false;
    }

    if (message.type !== this._trigger.type) {
      return false;
    }

    // Check channel match
    if (!this._trigger.channel.matches(message.data.channel)) {
      return false;
    }

    // Check specific trigger criteria
    switch (message.type) {
      case MidiMessageType.NOTE:
        if (this._trigger.type !== MidiMessageType.NOTE) return false;
        if (message.data.note !== this._trigger.note) return false;
        if (this._trigger.velocityRange) {
          const [min, max] = this._trigger.velocityRange;
          if (message.data.velocity < min || message.data.velocity > max) return false;
        }
        return true;

      case MidiMessageType.CC:
        if (this._trigger.type !== MidiMessageType.CC) return false;
        if (message.data.controller !== this._trigger.controller) return false;
        if (this._trigger.valueRange) {
          const [min, max] = this._trigger.valueRange;
          if (message.data.value < min || message.data.value > max) return false;
        }
        return true;

      case MidiMessageType.PROGRAM_CHANGE:
        if (this._trigger.type !== MidiMessageType.PROGRAM_CHANGE) return false;
        return message.data.program === this._trigger.program;
    }
  }

  /**
   * Create a new mapping with enabled/disabled state toggled
   */
  withEnabled(enabled: boolean): Mapping {
    return new Mapping(
      this._id,
      this._name,
      this._trigger,
      this._command,
      this._parameterMappings,
      enabled,
      this._midiDevice
    );
  }

  /**
   * Create a new mapping with updated name
   */
  withName(name: string): Mapping {
    return new Mapping(
      this._id,
      name,
      this._trigger,
      this._command,
      this._parameterMappings,
      this._enabled,
      this._midiDevice
    );
  }

  toString(): string {
    const triggerStr = this.triggerToString();
    return `${this._name}: ${triggerStr} → ${this._command.toString()}`;
  }

  private triggerToString(): string {
    switch (this._trigger.type) {
      case MidiMessageType.NOTE:
        return `Note ${this._trigger.note} ${this._trigger.channel.toString()}`;
      case MidiMessageType.CC:
        return `CC ${this._trigger.controller} ${this._trigger.channel.toString()}`;
      case MidiMessageType.PROGRAM_CHANGE:
        return `PC ${this._trigger.program} ${this._trigger.channel.toString()}`;
    }
  }

  toJSON(): unknown {
    return {
      id: this._id,
      name: this._name,
      trigger: this._trigger,
      command: this._command.toJSON(),
      parameterMappings: [...this._parameterMappings],
      enabled: this._enabled,
      midiDevice: this._midiDevice
    };
  }
}

