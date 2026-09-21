const {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
} = require("electron");

const path = require("path");
const { hang } = require("process");

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

ipcMain.handle('show-rules',async ()=>{
    const res = await dialog.showMessageBox(win, {
      type:"info",
      title:"Exam Rules",
      message:"please follow this things",
      detail:`
      1.Do not open any new tab
      2.You will get 0 marks if you cheat
      `,
      buttons:["Accept","Cancel"]
    })
    console.log(res)
    return res.response
})

ipcMain.handle('capture',async ()=>{
  
})

app.whenReady().then(() => {
  createWindow();
});