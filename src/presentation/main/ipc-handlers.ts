import { ipcMain } from 'electron';
import { Container } from 'inversify';
import { TYPES } from '@shared/types/DITypes';

// Use Cases
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
import { IMidiInputService } from '@domain/services/IMidiInputService';
import { IOscOutputService } from '@domain/services/IOscOutputService';

/**
 * IPC Handlers
 * Routes IPC calls from renderer to use cases
 */
export class IpcHandlers {
  constructor(private container: Container) {}

  register(): void {
    // Mappings
    ipcMain.handle('mappings:getAll', async () => {
      const useCase = this.container.get<GetAllMappings>(TYPES.GetAllMappings);
      return await useCase.execute();
    });

    ipcMain.handle('mappings:create', async (_, input) => {
      const useCase = this.container.get<CreateMapping>(TYPES.CreateMapping);
      return await useCase.execute(input);
    });

    ipcMain.handle('mappings:update', async (_, input) => {
      const useCase = this.container.get<UpdateMapping>(TYPES.UpdateMapping);
      return await useCase.execute(input);
    });

    ipcMain.handle('mappings:delete', async (_, input) => {
      const useCase = this.container.get<DeleteMapping>(TYPES.DeleteMapping);
      return await useCase.execute(input);
    });

    // MIDI
    ipcMain.handle('midi:getDevices', async () => {
      const useCase = this.container.get<GetMidiDevices>(TYPES.GetMidiDevices);
      return await useCase.execute();
    });

    ipcMain.handle('midi:selectDevice', async (_, input) => {
      const useCase = this.container.get<SelectMidiDevice>(TYPES.SelectMidiDevice);
      return await useCase.execute(input);
    });

    // Learn Mode
    ipcMain.handle('learn:start', async (_, input) => {
      const useCase = this.container.get<StartLearnMode>(TYPES.StartLearnMode);
      return await useCase.execute(input);
    });

    ipcMain.handle('learn:stop', () => {
      const useCase = this.container.get<StartLearnMode>(TYPES.StartLearnMode);
      useCase.cancel();
      return { success: true };
    });

    ipcMain.handle('learn:isActive', () => {
      const useCase = this.container.get<StartLearnMode>(TYPES.StartLearnMode);
      return useCase.isActive();
    });

    // Tracks
    ipcMain.handle('tracks:fetch', async (_, forceRefresh?: boolean) => {
      const useCase = this.container.get<FetchTrackNames>(TYPES.FetchTrackNames);
      return await useCase.execute(forceRefresh);
    });

    // Config
    ipcMain.handle('config:get', async () => {
      const useCase = this.container.get<GetConfig>(TYPES.GetConfig);
      return await useCase.execute();
    });

    ipcMain.handle('config:update', async (_, input) => {
      const useCase = this.container.get<UpdateConfig>(TYPES.UpdateConfig);
      return await useCase.execute(input);
    });

    // OSC
    ipcMain.handle('osc:test', async () => {
      const useCase = this.container.get<TestOscConnection>(TYPES.TestOscConnection);
      return await useCase.execute();
    });

    ipcMain.handle('osc:connect', async () => {
      const oscService = this.container.get<IOscOutputService>(TYPES.OscOutputService);
      const config = this.container.get<GetConfig>(TYPES.GetConfig);
      const configResult = await config.execute();
      
      if (configResult.isFailure()) {
        return configResult;
      }

      return oscService.connect(configResult.value.oscHost, configResult.value.oscPort);
    });
  }

  /**
   * Set up MIDI input processing
   */
  setupMidiProcessing(webContents: Electron.WebContents): void {
    const midiService = this.container.get<IMidiInputService>(TYPES.MidiInputService);
    const processMidiInput = this.container.get<ProcessMidiInput>(TYPES.ProcessMidiInput);

    // Listen for MIDI messages and process them (with source device info)
    midiService.onMessage(async (message, sourceDevice) => {
      // Process the MIDI message through the mapping engine
      await processMidiInput.execute(message, sourceDevice);

      // Notify renderer about MIDI activity
      webContents.send('midi:message', {
        type: message.type,
        data: message.data.toJSON(),
        sourceDevice
      });
    });
  }
}

