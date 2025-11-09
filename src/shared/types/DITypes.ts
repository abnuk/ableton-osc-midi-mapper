/**
 * Dependency Injection Types
 * Symbols for InversifyJS container bindings
 */
export const TYPES = {
  // Repositories
  MappingRepository: Symbol.for('IMappingRepository'),
  ConfigRepository: Symbol.for('IConfigRepository'),

  // Services
  MidiInputService: Symbol.for('IMidiInputService'),
  OscOutputService: Symbol.for('IOscOutputService'),
  TrackNameResolver: Symbol.for('ITrackNameResolver'),

  // Use Cases
  CreateMapping: Symbol.for('CreateMapping'),
  DeleteMapping: Symbol.for('DeleteMapping'),
  GetAllMappings: Symbol.for('GetAllMappings'),
  UpdateMapping: Symbol.for('UpdateMapping'),
  ProcessMidiInput: Symbol.for('ProcessMidiInput'),
  StartLearnMode: Symbol.for('StartLearnMode'),
  StopLearnMode: Symbol.for('StopLearnMode'),
  SelectMidiDevice: Symbol.for('SelectMidiDevice'),
  GetMidiDevices: Symbol.for('GetMidiDevices'),
  FetchTrackNames: Symbol.for('FetchTrackNames'),
  GetConfig: Symbol.for('GetConfig'),
  UpdateConfig: Symbol.for('UpdateConfig'),
  TestOscConnection: Symbol.for('TestOscConnection')
};

