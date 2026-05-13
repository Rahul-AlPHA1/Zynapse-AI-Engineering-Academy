const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('node:path');

const isDev = !app.isPackaged;
const PORT = process.env.PORT || '3099';
const START_URL = process.env.ZYNAPSE_ELECTRON_URL || `http://localhost:${PORT}`;
const iconPath = isDev
  ? path.join(__dirname, '..', 'build', 'icon.ico')
  : path.join(process.resourcesPath, 'build', 'icon.ico');

let mainWindow;
let appServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1080,
    minHeight: 720,
    title: 'Zynapse',
    icon: iconPath,
    backgroundColor: '#050508',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(START_URL);
}

async function startBundledServer() {
  if (isDev) return;

  process.env.NODE_ENV = 'production';
  process.env.PORT = PORT;
  process.env.ZYNAPSE_AUTOSTART = 'false';
  process.env.ZYNAPSE_DIST_DIR = path.join(process.resourcesPath, 'dist');

  const serverPath = path.join(process.resourcesPath, 'server', 'server.cjs');
  const serverModule = require(serverPath);
  appServer = await serverModule.startServer(Number(PORT));
}

app.whenReady().then(async () => {
  try {
    await startBundledServer();
  } catch (error) {
    dialog.showErrorBox('Zynapse startup failed', error instanceof Error ? error.message : String(error));
    app.quit();
    return;
  }

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (appServer) appServer.close();
  if (process.platform !== 'darwin') app.quit();
});
