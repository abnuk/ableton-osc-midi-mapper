/**
 * OSC Address Value Object
 * Represents a validated OSC address path
 */
export class OscAddress {
  private constructor(private readonly _path: string) {
    if (!_path.startsWith('/')) {
      throw new Error(`Invalid OSC address: ${_path}. Must start with '/'.`);
    }
    if (_path.includes('//')) {
      throw new Error(`Invalid OSC address: ${_path}. Cannot contain '//'.`);
    }
    if (!/^[a-zA-Z0-9/_-]+$/.test(_path)) {
      throw new Error(
        `Invalid OSC address: ${_path}. Can only contain alphanumeric, '/', '_', and '-' characters.`
      );
    }
  }

  static create(path: string): OscAddress {
    return new OscAddress(path);
  }

  get path(): string {
    return this._path;
  }

  equals(other: OscAddress): boolean {
    return this._path === other._path;
  }

  /**
   * Check if this address matches a pattern with wildcards
   */
  matchesPattern(pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*/g, '[^/]+')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(this._path);
  }

  /**
   * Get the category (first part) of the address
   * e.g., /live/song/get/tempo -> "song"
   */
  getCategory(): string | null {
    const parts = this._path.split('/').filter(p => p.length > 0);
    return parts.length >= 2 ? parts[1] : null;
  }

  /**
   * Get the action (get/set/fire/etc) from the address
   */
  getAction(): string | null {
    const parts = this._path.split('/').filter(p => p.length > 0);
    return parts.length >= 3 ? parts[2] : null;
  }

  toString(): string {
    return this._path;
  }

  toJSON(): string {
    return this._path;
  }
}

