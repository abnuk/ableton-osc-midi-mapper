import { app, BrowserWindow, nativeImage } from 'electron';
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
 * Set macOS Dock icon (especially important for development mode)
 */
function setDockIcon(): void {
  if (process.platform !== 'darwin') return;
  
  // Try multiple icon paths in order of preference
  const iconPaths: string[] = [];
  
  if (app.isPackaged) {
    // In packaged app, try icns first, then png
    iconPaths.push(path.join(process.resourcesPath, 'icon.icns'));
    iconPaths.push(path.join(process.resourcesPath, 'icon.png'));
  } else {
    // Development mode - load from build folder
    iconPaths.push(path.join(__dirname, '../../..', 'build', 'icon.icns'));
    iconPaths.push(path.join(__dirname, '../../..', 'build', 'icon.png'));
  }
  
  for (const iconPath of iconPaths) {
    try {
      const icon = nativeImage.createFromPath(iconPath);
      if (!icon.isEmpty()) {
        app.dock.setIcon(icon);
        console.log('🖼️ Dock icon set from:', iconPath);
        return;
      }
    } catch (error) {
      // Try next path
    }
  }
  
  console.warn('⚠️ Could not set Dock icon from any path');
}

/**
 * Get app icon for window (works on both platforms)
 */
function getAppIcon(): Electron.NativeImage | undefined {
  const iconPaths: string[] = [];
  
  if (app.isPackaged) {
    if (process.platform === 'win32') {
      iconPaths.push(path.join(process.resourcesPath, 'icon.ico'));
    } else {
      iconPaths.push(path.join(process.resourcesPath, 'icon.icns'));
    }
    iconPaths.push(path.join(process.resourcesPath, 'icon.png'));
  } else {
    // Development mode
    if (process.platform === 'win32') {
      iconPaths.push(path.join(__dirname, '../../..', 'build', 'icon.ico'));
    } else {
      iconPaths.push(path.join(__dirname, '../../..', 'build', 'icon.icns'));
    }
    iconPaths.push(path.join(__dirname, '../../..', 'build', 'icon.png'));
  }
  
  for (const iconPath of iconPaths) {
    try {
      const icon = nativeImage.createFromPath(iconPath);
      if (!icon.isEmpty()) {
        return icon;
      }
    } catch (error) {
      // Try next path
    }
  }
  
  return undefined;
}

/**
 * Create the main window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until ready
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
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
    if (!(app as any).isQuitting) {
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
app.whenReady().then(() => {
  console.log('🎬 Electron app is ready');
  
  // Set dock icon first (macOS)
  setDockIcon();
  
  initialize();
});

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

