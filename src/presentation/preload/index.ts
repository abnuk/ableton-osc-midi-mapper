import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script
 * Exposes safe IPC methods to renderer process
 */
contextBridge.exposeInMainWorld('api', {
  // Mappings
  mappings: {
    getAll: () => ipcRenderer.invoke('mappings:getAll'),
    create: (input: any) => ipcRenderer.invoke('mappings:create', input),
    update: (input: any) => ipcRenderer.invoke('mappings:update', input),
    delete: (input: any) => ipcRenderer.invoke('mappings:delete', input)
  },

  // MIDI
  midi: {
    getDevices: () => ipcRenderer.invoke('midi:getDevices'),
    selectDevice: (input: any) => ipcRenderer.invoke('midi:selectDevice', input),
    onMessage: (callback: (message: any) => void) => {
      ipcRenderer.on('midi:message', (_, message) => callback(message));
      return () => ipcRenderer.removeAllListeners('midi:message');
    }
  },

  // Learn Mode
  learn: {
    start: (input: any) => ipcRenderer.invoke('learn:start', input),
    stop: () => ipcRenderer.invoke('learn:stop'),
    isActive: () => ipcRenderer.invoke('learn:isActive'),
    onComplete: (callback: () => void) => {
      ipcRenderer.on('learn:complete', () => callback());
      return () => ipcRenderer.removeAllListeners('learn:complete');
    }
  },

  // Tracks
  tracks: {
    fetch: (forceRefresh?: boolean) => ipcRenderer.invoke('tracks:fetch', forceRefresh)
  },

  // Config
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    update: (input: any) => ipcRenderer.invoke('config:update', input)
  },

  // OSC
  osc: {
    test: () => ipcRenderer.invoke('osc:test'),
    connect: () => ipcRenderer.invoke('osc:connect')
  }
});

// Type declaration for window.api (to be used in renderer)
export interface ElectronAPI {
  mappings: {
    getAll: () => Promise<any>;
    create: (input: any) => Promise<any>;
    update: (input: any) => Promise<any>;
    delete: (input: any) => Promise<any>;
  };
  midi: {
    getDevices: () => Promise<any>;
    selectDevice: (input: any) => Promise<any>;
    onMessage: (callback: (message: any) => void) => () => void;
  };
  learn: {
    start: (input: any) => Promise<any>;
    stop: () => Promise<any>;
    isActive: () => Promise<boolean>;
    onComplete: (callback: () => void) => () => void;
  };
  tracks: {
    fetch: (forceRefresh?: boolean) => Promise<any>;
  };
  config: {
    get: () => Promise<any>;
    update: (input: any) => Promise<any>;
  };
  osc: {
    test: () => Promise<any>;
    connect: () => Promise<any>;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

