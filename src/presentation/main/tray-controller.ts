import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import * as path from 'path';

/**
 * Tray Controller
 * Manages system tray icon and menu
 */
export class TrayController {
  private tray: Tray | null = null;
  private window: BrowserWindow | null = null;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  create(): void {
    try {
      console.log('TrayController.create() called');
      
      // Get the tray icon - required for Windows, optional for macOS
      const trayIcon = this.getTrayIcon();
      
      // Create tray with icon (Windows requires a valid icon to show in tray)
      this.tray = new Tray(trayIcon);
      console.log('Tray instance created');
      
      // Set emoji keyboard for macOS - visible and clear
      if (process.platform === 'darwin') {
        this.tray.setTitle('🎹');  // Piano keyboard emoji
        console.log('Tray title set to keyboard emoji');
      }
      
      this.tray.setToolTip('Ableton OSC MIDI Mapper');
      console.log('Tooltip set');
      
      // Create context menu
      this.updateContextMenu();
      console.log('Context menu updated');

      // Handle click on tray icon
      this.tray.on('click', () => {
        console.log('Tray icon clicked');
        this.toggleWindow();
      });
      
      console.log('Tray created successfully');
    } catch (error) {
      console.error('Error creating tray icon:', error);
      console.error('Stack trace:', (error as Error).stack);
    }
  }
  
  /**
   * Get the tray icon for the current platform
   * Windows requires a valid icon image to display in the system tray
   */
  private getTrayIcon(): Electron.NativeImage {
    const iconPaths: string[] = [];
    
    if (app.isPackaged) {
      // In packaged app, icons are in resources folder
      if (process.platform === 'win32') {
        iconPaths.push(path.join(process.resourcesPath, 'icon.ico'));
      }
      iconPaths.push(path.join(process.resourcesPath, 'icon.png'));
    } else {
      // Development mode - load from build folder
      // __dirname is dist/main, so we need ../.. to get to project root
      if (process.platform === 'win32') {
        iconPaths.push(path.join(__dirname, '../..', 'build', 'icon.ico'));
      }
      iconPaths.push(path.join(__dirname, '../..', 'build', 'icon.png'));
    }
    
    for (const iconPath of iconPaths) {
      try {
        console.log('Trying tray icon path:', iconPath);
        const icon = nativeImage.createFromPath(iconPath);
        if (!icon.isEmpty()) {
          // Resize for tray - Windows typically uses 16x16 or 32x32
          const resized = icon.resize({ width: 16, height: 16 });
          console.log('Tray icon loaded from:', iconPath);
          return resized;
        }
      } catch (error) {
        console.log('Failed to load icon from:', iconPath, error);
      }
    }
    
    console.warn('Could not load tray icon, using empty image');
    return nativeImage.createEmpty();
  }

  private updateContextMenu(): void {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Window',
        click: () => {
          this.showWindow();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  private toggleWindow(): void {
    if (!this.window) return;

    if (this.window.isVisible()) {
      this.window.hide();
    } else {
      this.showWindow();
    }
  }

  private showWindow(): void {
    if (!this.window) return;

    this.window.show();
    this.window.focus();
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

