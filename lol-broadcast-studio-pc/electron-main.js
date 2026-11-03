/**
 * Electron Desktop Shell for LoL Broadcast Studio PC
 * Cloned & Upgraded from RCVolus/lol-pick-ban-ui electron-main.js
 */
const { app, BrowserWindow } = require('electron');
require('./server.js');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1640,
    height: 960,
    minWidth: 1280,
    minHeight: 760,
    backgroundColor: '#070a12',
    darkTheme: true,
    center: true,
    autoHideMenuBar: true,
    title: 'LoL Broadcast Studio PC — Apple Liquid Glass Edition (LCK / Worlds Director)',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL('http://localhost:3080');
});
