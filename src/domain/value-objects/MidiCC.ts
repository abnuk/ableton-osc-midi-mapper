/**
 * MIDI Control Change (CC) Value Object
 * Represents a MIDI CC message
 */
export class MidiCC {
  private constructor(
    private readonly _controller: number,
    private readonly _value: number,
    private readonly _channel: number
  ) {
    if (_controller < 0 || _controller > 127) {
      throw new Error(`Invalid MIDI CC controller: ${_controller}. Must be between 0 and 127.`);
    }
    if (_value < 0 || _value > 127) {
      throw new Error(`Invalid CC value: ${_value}. Must be between 0 and 127.`);
    }
    if (_channel < 1 || _channel > 16) {
      throw new Error(`Invalid MIDI channel: ${_channel}. Must be between 1 and 16.`);
    }
  }

  static create(controller: number, value: number, channel: number): MidiCC {
    return new MidiCC(controller, value, channel);
  }

  get controller(): number {
    return this._controller;
  }

  get value(): number {
    return this._value;
  }

  get channel(): number {
    return this._channel;
  }

  /**
   * Normalize CC value to 0.0-1.0 range
   */
  get normalizedValue(): number {
    return this._value / 127;
  }

  equals(other: MidiCC): boolean {
    return (
      this._controller === other._controller &&
      this._value === other._value &&
      this._channel === other._channel
    );
  }

  matchesController(controller: number, channel?: number): boolean {
    if (channel !== undefined && this._channel !== channel) {
      return false;
    }
    return this._controller === controller;
  }

  toString(): string {
    return `CC${this._controller}:${this._value} ch:${this._channel}`;
  }

  toJSON(): { controller: number; value: number; channel: number } {
    return {
      controller: this._controller,
      value: this._value,
      channel: this._channel
    };
  }
}

