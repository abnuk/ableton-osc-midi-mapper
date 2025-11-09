"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  // Mappings
  mappings: {
    getAll: () => electron.ipcRenderer.invoke("mappings:getAll"),
    create: (input) => electron.ipcRenderer.invoke("mappings:create", input),
    update: (input) => electron.ipcRenderer.invoke("mappings:update", input),
    delete: (input) => electron.ipcRenderer.invoke("mappings:delete", input)
  },
  // MIDI
  midi: {
    getDevices: () => electron.ipcRenderer.invoke("midi:getDevices"),
    selectDevice: (input) => electron.ipcRenderer.invoke("midi:selectDevice", input),
    onMessage: (callback) => {
      electron.ipcRenderer.on("midi:message", (_, message) => callback(message));
      return () => electron.ipcRenderer.removeAllListeners("midi:message");
    }
  },
  // Learn Mode
  learn: {
    start: (input) => electron.ipcRenderer.invoke("learn:start", input),
    stop: () => electron.ipcRenderer.invoke("learn:stop"),
    isActive: () => electron.ipcRenderer.invoke("learn:isActive")
  },
  // Tracks
  tracks: {
    fetch: (forceRefresh) => electron.ipcRenderer.invoke("tracks:fetch", forceRefresh)
  },
  // Config
  config: {
    get: () => electron.ipcRenderer.invoke("config:get"),
    update: (input) => electron.ipcRenderer.invoke("config:update", input)
  },
  // OSC
  osc: {
    test: () => electron.ipcRenderer.invoke("osc:test"),
    connect: () => electron.ipcRenderer.invoke("osc:connect")
  }
});
