/**
 * MIDI Channel Value Object
 * Represents a MIDI channel (1-16) or "all channels"
 */
export class MidiChannel {
  private constructor(private readonly _value: number | 'all') {}

  static all(): MidiChannel {
    return new MidiChannel('all');
  }

  static channel(num: number): MidiChannel {
    if (num < 1 || num > 16) {
      throw new Error(`Invalid MIDI channel: ${num}. Must be between 1 and 16.`);
    }
    return new MidiChannel(num);
  }

  static fromValue(value: number | 'all'): MidiChannel {
    if (value === 'all') {
      return MidiChannel.all();
    }
    return MidiChannel.channel(value);
  }

  get value(): number | 'all' {
    return this._value;
  }

  isAll(): boolean {
    return this._value === 'all';
  }

  matches(channel: number): boolean {
    return this._value === 'all' || this._value === channel;
  }

  equals(other: MidiChannel): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value === 'all' ? 'All Channels' : `Channel ${this._value}`;
  }

  toJSON(): number | 'all' {
    return this._value;
  }
}

