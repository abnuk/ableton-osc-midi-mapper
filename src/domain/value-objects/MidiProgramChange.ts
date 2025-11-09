/**
 * MIDI Program Change Value Object
 * Represents a MIDI program change message
 */
export class MidiProgramChange {
  private constructor(
    private readonly _program: number,
    private readonly _channel: number
  ) {
    if (_program < 0 || _program > 127) {
      throw new Error(`Invalid MIDI program: ${_program}. Must be between 0 and 127.`);
    }
    if (_channel < 1 || _channel > 16) {
      throw new Error(`Invalid MIDI channel: ${_channel}. Must be between 1 and 16.`);
    }
  }

  static create(program: number, channel: number): MidiProgramChange {
    return new MidiProgramChange(program, channel);
  }

  get program(): number {
    return this._program;
  }

  get channel(): number {
    return this._channel;
  }

  equals(other: MidiProgramChange): boolean {
    return (
      this._program === other._program &&
      this._channel === other._channel
    );
  }

  matchesProgram(program: number, channel?: number): boolean {
    if (channel !== undefined && this._channel !== channel) {
      return false;
    }
    return this._program === program;
  }

  toString(): string {
    return `PC${this._program} ch:${this._channel}`;
  }

  toJSON(): { program: number; channel: number } {
    return {
      program: this._program,
      channel: this._channel
    };
  }
}

