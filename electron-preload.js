const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopUpdates", {
  onStatus(callback) {
    ipcRenderer.on("desktop-update-status", (_event, data) => callback(data));
  },
  check: () => ipcRenderer.invoke("desktop-update-check"),
  download: () => ipcRenderer.invoke("desktop-update-download"),
  install: () => ipcRenderer.invoke("desktop-update-install"),
});
