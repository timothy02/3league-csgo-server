import { ipcMain } from 'electron';
import SteamCmd from '../lib/steamcmd';
import db from '../db/index';
import { IPCSteamCMDCommands, ServerStatus, SteamCMDStatus } from './protocol';


/**
 * Temporary solution. SteamCmd initialization will be moved when support more than 1 server is implemented.
 */
const defaultConfig = {
    downloadDir: "temp",
    installDir: "steam",
    baseDir: "server",
    steamCmdUrl: "http://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip",
    scriptsDir: "server_assets/scripts"
}

const steamCmd = new SteamCmd(defaultConfig);

ipcMain.on(IPCSteamCMDCommands.RUN_STEAMCMD_DOWNLOAD, async (event) => {
    console.log(`IpcMain recieved ${IPCSteamCMDCommands.RUN_STEAMCMD_DOWNLOAD} event.`);

    const statusListener = async(status: string) => {
        event.reply(IPCSteamCMDCommands.STEAMCMD_STATUS_UPDATE, status);

        if(status == SteamCMDStatus.STEAMCMD_FINISHED){
            const newServer = await db.Servers.create({
                name: "default",
                installStatuses: [{
                    status: SteamCMDStatus.STEAMCMD_FINISHED,
                    protocol: IPCSteamCMDCommands.STEAMCMD_STATUS_UPDATE
                }],
                status: ServerStatus.NOT_READY,
                installDir: steamCmd.installDir
            });

           await db.Session.setDefaultServer(newServer._id);
        }
    }
    const messageListener = (message: string) => {
        event.reply(IPCSteamCMDCommands.STEAMCMD_MESSAGE_UPDATE, message);
    }
    steamCmd.addListener("status", statusListener);
    steamCmd.addListener("message", messageListener);

    await steamCmd.steamCmdSetup();

    steamCmd.removeListener("status", statusListener);
    steamCmd.removeListener("message", messageListener);
});

ipcMain.on(IPCSteamCMDCommands.RUN_CSGO_DOWNLOAD, async (event) => {
    console.log(`IpcMain recieved ${IPCSteamCMDCommands.RUN_CSGO_DOWNLOAD} event.`);

    const statusListener = async (status: string) => {
        event.reply(IPCSteamCMDCommands.STEAMCMD_STATUS_UPDATE, status);

        if(status == SteamCMDStatus.CSGO_FINISHED){
            const serverId = await db.Session.getDefaultServerId();
            await db.Servers.update(serverId, {
                $push: {installStatuses: {
                    protocol: IPCSteamCMDCommands.STEAMCMD_STATUS_UPDATE,
                    status: SteamCMDStatus.CSGO_FINISHED
                }}
            });
        }
    }
    const messageListener = (message: string) => {
        event.reply(IPCSteamCMDCommands.CSGO_STEAMCMD_MESSAGE_UPDATE, message);
    }
    steamCmd.addListener("status", statusListener);
    steamCmd.addListener("message", messageListener);

    await steamCmd.csgoSetup();

    steamCmd.removeListener("status", statusListener);
    steamCmd.removeListener("message", messageListener);
});