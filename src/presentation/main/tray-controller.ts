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
      
      // Create tray with empty icon first
      this.tray = new Tray(nativeImage.createEmpty());
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
      
      console.log('Tray created successfully with keyboard emoji');
    } catch (error) {
      console.error('Error creating tray icon:', error);
      console.error('Stack trace:', (error as Error).stack);
    }
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

  private getIconPath(): string {
    // Try to load icon from resources
    const platformPath = process.platform === 'darwin' 
      ? 'iconTemplate.png'  // macOS uses template icons
      : 'icon.png';

    // Use app.getAppPath() which works in both dev and production
    const iconPath = path.join(app.getAppPath(), 'resources', platformPath);
    console.log('Attempting to load icon from:', iconPath);
    console.log('app.getAppPath():', app.getAppPath());
    console.log('__dirname:', __dirname);
    
    return iconPath;
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

