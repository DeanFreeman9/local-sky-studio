const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const express = require("express");
const fs = require("fs");
const path = require("path");

let mainWindow;
let localServer;

function sendUpdate(status, detail = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("desktop-update-status", { status, ...detail });
  }
}

function readUpdateConfig() {
  const configPath = app.isPackaged
    ? path.join(process.resourcesPath, "update-config.json")
    : path.join(__dirname, "update-config.json");
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (_) {
    return { enabled: false };
  }
}

function configureUpdates() {
  const config = readUpdateConfig();
  if (!app.isPackaged || !config.enabled) return;
  if (!config.owner || !config.repo) {
    sendUpdate("error", { message: "Updates are not configured for this build." });
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.setFeedURL({
    provider: "github",
    owner: config.owner,
    repo: config.repo,
  });
  autoUpdater.on("checking-for-update", () => sendUpdate("checking"));
  autoUpdater.on("update-not-available", () => sendUpdate("not-available"));
  autoUpdater.on("update-available", (info) =>
    sendUpdate("available", { version: info.version }),
  );
  autoUpdater.on("download-progress", (progress) =>
    sendUpdate("downloading", { percent: Math.round(progress.percent) }),
  );
  autoUpdater.on("update-downloaded", (info) =>
    sendUpdate("downloaded", { version: info.version }),
  );
  autoUpdater.on("error", (error) =>
    sendUpdate("error", { message: error.message }),
  );
  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 3000);
}

function startLocalServer() {
  return new Promise((resolve, reject) => {
    const localApp = express();
    localApp.use(express.static(path.join(__dirname, "public")));
    localServer = localApp.listen(0, "127.0.0.1", () => {
      const { port } = localServer.address();
      resolve(`http://127.0.0.1:${port}`);
    });
    localServer.on("error", reject);
  });
}

function createWindow(localUrl) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 680,
    title: "Local Sky Studio",
    webPreferences: {
      preload: path.join(__dirname, "electron-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadURL(localUrl);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
      if (/^(https?:|mailto:)/i.test(url)) shell.openExternal(url);
    }
  });
}

ipcMain.handle("desktop-update-download", () => autoUpdater.downloadUpdate());
ipcMain.handle("desktop-update-install", () => autoUpdater.quitAndInstall());
ipcMain.handle("desktop-update-check", () => {
  if (!app.isPackaged || !readUpdateConfig().enabled) return false;
  return autoUpdater.checkForUpdates();
});

app.whenReady().then(async () => {
  const localUrl = await startLocalServer();
  createWindow(localUrl);
  configureUpdates();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(localUrl);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
