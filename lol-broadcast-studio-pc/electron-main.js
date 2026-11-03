/**
 * Electron Native Desktop Shell for LoL Broadcast Studio PC
 */
const { app, BrowserWindow } = require('electron');

// Start local backend engine (handles EADDRINUSE safely if already running)
require('./server.js');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 800,
    minWidth: 1080,
    minHeight: 680,
    backgroundColor: '#060913',
    darkTheme: true,
    center: true,
    show: true,
    autoHideMenuBar: true,
    title: 'LoL Broadcast Studio PC — Apple Liquid Glass Edition (LCK / Worlds Director)',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:3080');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true);
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setAlwaysOnTop(false);
      }
    }, 1200);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

app.whenReady().then(() => {
  setTimeout(createWindow, 250);
});

app.on('window-all-closed', () => {
  app.quit();
});
