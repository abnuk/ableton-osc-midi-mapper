import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from '@shared/types/DITypes';

// Domain Interfaces
import { IMappingRepository } from '@domain/repositories/IMappingRepository';
import { IConfigRepository } from '@domain/repositories/IConfigRepository';
import { IMidiInputService } from '@domain/services/IMidiInputService';
import { IOscOutputService } from '@domain/services/IOscOutputService';
import { ITrackNameResolver } from '@domain/services/ITrackNameResolver';

// Infrastructure Implementations
import { InMemoryMappingRepository } from '@infrastructure/persistence/InMemoryMappingRepository';
import { ElectronStoreConfigRepository } from '@infrastructure/persistence/ElectronStoreConfigRepository';
import { EasyMidiAdapter } from '@infrastructure/midi/EasyMidiAdapter';
import { NodeOscAdapter } from '@infrastructure/osc/NodeOscAdapter';
import { OscTrackNameResolver } from '@infrastructure/track-resolution/OscTrackNameResolver';

// Application Use Cases
import { CreateMapping } from '@application/use-cases/CreateMapping';
import { DeleteMapping } from '@application/use-cases/DeleteMapping';
import { GetAllMappings } from '@application/use-cases/GetAllMappings';
import { UpdateMapping } from '@application/use-cases/UpdateMapping';
import { ProcessMidiInput } from '@application/use-cases/ProcessMidiInput';
import { StartLearnMode } from '@application/use-cases/StartLearnMode';
import { SelectMidiDevice } from '@application/use-cases/SelectMidiDevice';
import { GetMidiDevices } from '@application/use-cases/GetMidiDevices';
import { FetchTrackNames } from '@application/use-cases/FetchTrackNames';
import { GetConfig } from '@application/use-cases/GetConfig';
import { UpdateConfig } from '@application/use-cases/UpdateConfig';
import { TestOscConnection } from '@application/use-cases/TestOscConnection';
import { ManageTrack } from '@application/use-cases/ManageTrack';

/**
 * Create and configure the dependency injection container
 */
export function createContainer(): Container {
  const container = new Container();

  // Bind Repositories
  container.bind<IMappingRepository>(TYPES.MappingRepository).to(InMemoryMappingRepository).inSingletonScope();
  container.bind<IConfigRepository>(TYPES.ConfigRepository).to(ElectronStoreConfigRepository).inSingletonScope();

  // Bind Services
  container.bind<IMidiInputService>(TYPES.MidiInputService).to(EasyMidiAdapter).inSingletonScope();
  container.bind<IOscOutputService>(TYPES.OscOutputService).to(NodeOscAdapter).inSingletonScope();
  container.bind<ITrackNameResolver>(TYPES.TrackNameResolver).to(OscTrackNameResolver).inSingletonScope();

  // Bind Use Cases
  container.bind<CreateMapping>(TYPES.CreateMapping).to(CreateMapping);
  container.bind<DeleteMapping>(TYPES.DeleteMapping).to(DeleteMapping);
  container.bind<GetAllMappings>(TYPES.GetAllMappings).to(GetAllMappings);
  container.bind<UpdateMapping>(TYPES.UpdateMapping).to(UpdateMapping);
  container.bind<ProcessMidiInput>(TYPES.ProcessMidiInput).to(ProcessMidiInput);
  container.bind<StartLearnMode>(TYPES.StartLearnMode).to(StartLearnMode).inSingletonScope();
  container.bind<SelectMidiDevice>(TYPES.SelectMidiDevice).to(SelectMidiDevice);
  container.bind<GetMidiDevices>(TYPES.GetMidiDevices).to(GetMidiDevices);
  container.bind<FetchTrackNames>(TYPES.FetchTrackNames).to(FetchTrackNames);
  container.bind<GetConfig>(TYPES.GetConfig).to(GetConfig);
  container.bind<UpdateConfig>(TYPES.UpdateConfig).to(UpdateConfig);
  container.bind<TestOscConnection>(TYPES.TestOscConnection).to(TestOscConnection);
  container.bind<ManageTrack>(TYPES.ManageTrack).to(ManageTrack);

  return container;
}

