/**
 * MIDI Note Value Object
 * Represents a MIDI note on/off message
 */
export class MidiNote {
  private constructor(
    private readonly _note: number,
    private readonly _velocity: number,
    private readonly _channel: number
  ) {
    if (_note < 0 || _note > 127) {
      throw new Error(`Invalid MIDI note: ${_note}. Must be between 0 and 127.`);
    }
    if (_velocity < 0 || _velocity > 127) {
      throw new Error(`Invalid velocity: ${_velocity}. Must be between 0 and 127.`);
    }
    if (_channel < 1 || _channel > 16) {
      throw new Error(`Invalid MIDI channel: ${_channel}. Must be between 1 and 16.`);
    }
  }

  static create(note: number, velocity: number, channel: number): MidiNote {
    return new MidiNote(note, velocity, channel);
  }

  get note(): number {
    return this._note;
  }

  get velocity(): number {
    return this._velocity;
  }

  get channel(): number {
    return this._channel;
  }

  isNoteOn(): boolean {
    return this._velocity > 0;
  }

  isNoteOff(): boolean {
    return this._velocity === 0;
  }

  equals(other: MidiNote): boolean {
    return (
      this._note === other._note &&
      this._velocity === other._velocity &&
      this._channel === other._channel
    );
  }

  matchesNote(note: number, channel?: number): boolean {
    if (channel !== undefined && this._channel !== channel) {
      return false;
    }
    return this._note === note;
  }

  toString(): string {
    const noteName = this.getNoteName();
    return `${noteName} (${this._note}) vel:${this._velocity} ch:${this._channel}`;
  }

  private getNoteName(): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(this._note / 12) - 1;
    const noteName = noteNames[this._note % 12];
    return `${noteName}${octave}`;
  }

  toJSON(): { note: number; velocity: number; channel: number } {
    return {
      note: this._note,
      velocity: this._velocity,
      channel: this._channel
    };
  }
}

