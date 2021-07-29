import StepManager from "./renderer/steps";
import { ipcRenderer } from 'electron';
import { IPCCommunicationCommands } from './ipc/protocol';

ipcRenderer.on("STEAMCMD_STATUS_UPDATE", (event, status: string) => {
  console.log(status);
});

ipcRenderer.on("STEAMCMD_MESSAGE_UPDATE", (event, message: string) => {
  console.log(message);
});


window.addEventListener("DOMContentLoaded", () => {
  StepManager.run();

  ipcRenderer.send(IPCCommunicationCommands.REQUEST_SERVER_STATUSES);
});
