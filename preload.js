

window.addEventListener("DOMContentLoaded", () => {
  console.log("Calculator Loaded");
});

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  toggleFullScreen: () => ipcRenderer.send("window-toggle-fullscreen"),
  minimize: () => ipcRenderer.send("window-minimize"),
  close: () => ipcRenderer.send("window-close"),
});