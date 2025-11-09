/**
 * Track Info Entity
 * Represents information about an Ableton Live track
 */
export class TrackInfo {
  private constructor(
    private readonly _index: number,
    private readonly _name: string
  ) {
    if (_index < 0) {
      throw new Error(`Invalid track index: ${_index}. Must be >= 0.`);
    }
    if (_name.trim().length === 0) {
      throw new Error('Track name cannot be empty');
    }
  }

  static create(index: number, name: string): TrackInfo {
    return new TrackInfo(index, name.trim());
  }

  get index(): number {
    return this._index;
  }

  get name(): string {
    return this._name;
  }

  equals(other: TrackInfo): boolean {
    return this._index === other._index && this._name === other._name;
  }

  toString(): string {
    return `Track ${this._index}: ${this._name}`;
  }

  toJSON(): { index: number; name: string } {
    return {
      index: this._index,
      name: this._name
    };
  }
}

