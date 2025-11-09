import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { createContainer } from './di-container';
import { TrayController } from './tray-controller';
import { IpcHandlers } from './ipc-handlers';
import { IOscOutputService } from '@domain/services/IOscOutputService';
import { IConfigRepository } from '@domain/repositories/IConfigRepository';
import { TYPES } from '@shared/types/DITypes';

let mainWindow: BrowserWindow | null = null;
let trayController: TrayController | null = null;

/**
 * Create the main window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until ready
    skipTaskbar: true, // Don't show in taskbar/dock
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('=== WINDOW READY TO SHOW ===');
    mainWindow?.show();
  });

  // Prevent window from closing, just hide it instead
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Initialize the application
 */
async function initialize(): Promise<void> {
  // Create DI container
  const container = createContainer();

  // Set up IPC handlers
  const ipcHandlers = new IpcHandlers(container);
  ipcHandlers.register();

  // Create window
  createWindow();

  // Set up MIDI processing
  if (mainWindow) {
    ipcHandlers.setupMidiProcessing(mainWindow.webContents);
  }

  // Create system tray BEFORE hiding dock (important on macOS)
  if (mainWindow) {
    console.log('=== CREATING TRAY CONTROLLER ===');
    trayController = new TrayController(mainWindow);
    trayController.create();
    console.log('=== TRAY CONTROLLER CREATED ===');
    
    // Give tray time to initialize before hiding dock
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Now hide dock icon on macOS - AFTER tray is created
  if (process.platform === 'darwin') {
    console.log('=== HIDING DOCK ICON ===');
    try {
      app.dock.hide();
      console.log('=== DOCK ICON HIDDEN ===');
    } catch (error) {
      console.error('Error hiding dock:', error);
    }
  }

  // Connect to OSC on startup
  try {
    const configRepo = container.get<IConfigRepository>(TYPES.ConfigRepository);
    const oscService = container.get<IOscOutputService>(TYPES.OscOutputService);

    const configResult = await configRepo.get();
    if (configResult.isSuccess()) {
      const { oscHost, oscPort, autoReconnect } = configResult.value;
      
      if (autoReconnect) {
        const connectResult = oscService.connect(oscHost, oscPort);
        if (connectResult.isSuccess()) {
          console.log(`Connected to OSC at ${oscHost}:${oscPort}`);
        } else {
          console.error('Failed to connect to OSC:', connectResult.error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

/**
 * App lifecycle
 */
app.whenReady().then(initialize);

app.on('before-quit', () => {
  (app as any).isQuitting = true;
});

app.on('window-all-closed', () => {
  // Keep app running on macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

// Handle cleanup
app.on('will-quit', () => {
  if (trayController) {
    trayController.destroy();
  }
});

