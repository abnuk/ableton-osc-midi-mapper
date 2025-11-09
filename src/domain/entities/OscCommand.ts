import { OscAddress } from '../value-objects/OscAddress';

/**
 * OSC Parameter Types
 */
export enum OscParameterType {
  INTEGER = 'integer',
  FLOAT = 'float',
  STRING = 'string',
  BOOLEAN = 'boolean'
}

/**
 * OSC Parameter Definition
 */
export interface OscParameterDef {
  name: string;
  type: OscParameterType;
  optional: boolean;
  description?: string;
  min?: number;
  max?: number;
  defaultValue?: OscParameterValue;
}

/**
 * OSC Parameter Value Type
 */
export type OscParameterValue = number | string | boolean;

/**
 * OSC Command Entity
 * Represents a command to be sent via OSC
 */
export class OscCommand {
  private constructor(
    private readonly _address: OscAddress,
    private readonly _parameters: ReadonlyArray<OscParameterValue>
  ) {}

  static create(address: string | OscAddress, parameters: OscParameterValue[] = []): OscCommand {
    const oscAddress = typeof address === 'string' ? OscAddress.create(address) : address;
    return new OscCommand(oscAddress, parameters);
  }

  get address(): OscAddress {
    return this._address;
  }

  get parameters(): ReadonlyArray<OscParameterValue> {
    return this._parameters;
  }

  /**
   * Create a new command with substituted parameters
   */
  withParameters(parameters: OscParameterValue[]): OscCommand {
    return new OscCommand(this._address, parameters);
  }

  /**
   * Create a new command with a parameter value replaced
   */
  withParameter(index: number, value: OscParameterValue): OscCommand {
    if (index < 0 || index >= this._parameters.length) {
      throw new Error(`Parameter index ${index} out of bounds`);
    }
    const newParams = [...this._parameters];
    newParams[index] = value;
    return new OscCommand(this._address, newParams);
  }

  equals(other: OscCommand): boolean {
    if (!this._address.equals(other._address)) {
      return false;
    }
    if (this._parameters.length !== other._parameters.length) {
      return false;
    }
    return this._parameters.every((param, i) => param === other._parameters[i]);
  }

  toString(): string {
    const params = this._parameters.length > 0 
      ? ` ${this._parameters.join(' ')}` 
      : '';
    return `${this._address.path}${params}`;
  }

  toJSON(): { address: string; parameters: OscParameterValue[] } {
    return {
      address: this._address.path,
      parameters: [...this._parameters]
    };
  }
}

