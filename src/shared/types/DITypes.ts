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
  MidiOutputService: Symbol.for('IMidiOutputService'),
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
  GetMidiOutputDevices: Symbol.for('GetMidiOutputDevices'),
  SelectMidiOutputDevice: Symbol.for('SelectMidiOutputDevice'),
  SetMidiPassthrough: Symbol.for('SetMidiPassthrough'),
  FetchTrackNames: Symbol.for('FetchTrackNames'),
  GetConfig: Symbol.for('GetConfig'),
  UpdateConfig: Symbol.for('UpdateConfig'),
  TestOscConnection: Symbol.for('TestOscConnection'),
  ManageTrack: Symbol.for('ManageTrack')
};

