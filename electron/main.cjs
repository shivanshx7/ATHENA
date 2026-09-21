const {
  BrowserWindow,
  app,
  ipcMain,
} = require("electron");

const path = require("path");

let win = null;
let end_time = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL("http://localhost:5173/");
}

ipcMain.handle("full-screen", () => {
  win.setKiosk(true);
});

ipcMain.handle("start-test", () => {
  if (end_time !== null) {
    return;
  }

  end_time = Date.now() + 60 * 60 * 1000;
});

ipcMain.handle("get-time", () => {
  if (end_time === null) {
    return 0;
  }

  return Math.max(0, end_time - Date.now());
});

ipcMain.handle('show-rules',()=>{
  
})

app.whenReady().then(() => {
  createWindow();
});