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
    // Create tray icon
    const iconPath = this.getIconPath();
    const icon = nativeImage.createFromPath(iconPath);
    
    this.tray = new Tray(icon.resize({ width: 16, height: 16 }));
    this.tray.setToolTip('Ableton OSC MIDI Mapper');

    // Create context menu
    this.updateContextMenu();

    // Handle click on tray icon
    this.tray.on('click', () => {
      this.toggleWindow();
    });
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
    // For now, use a placeholder - you'd need to create actual icon files
    const platformPath = process.platform === 'darwin' 
      ? 'iconTemplate.png'  // macOS uses template icons
      : 'icon.png';

    return path.join(__dirname, '../../resources', platformPath);
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

