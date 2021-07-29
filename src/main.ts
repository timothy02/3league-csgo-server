import { app, BrowserWindow } from "electron";
import path from "path";
import db from "./db/index";
import "./ipc/index";

function createWindow() {
  const mainWindow = new BrowserWindow({
    height: 800,
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false,
      devTools: true,
      preload: path.join(__dirname, "preload.js"),
    },
    width: 500,
  });

  mainWindow.loadFile(path.join(__dirname, "../index.html"));
  mainWindow.webContents.openDevTools()
}

app.on("ready", () => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});