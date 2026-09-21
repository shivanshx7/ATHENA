const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setFullScreen: () => ipcRenderer.invoke("full-screen"),
  getRemainingTime: () => ipcRenderer.invoke("get-time"),
  startTest: () => ipcRenderer.invoke("start-test"),
});
