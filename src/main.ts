import { app, BrowserWindow } from "electron";
import path from "path";
import db from "./db/index";

interface CustomNodeJsGlobal extends NodeJS.Global {
  db: object;
}

declare const global: CustomNodeJsGlobal;

global.db = db;

require('electron-reload')(__dirname);

function createWindow() {
  const mainWindow = new BrowserWindow({
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 500,
  });

  mainWindow.loadFile(path.join(__dirname, "../index.html"));
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