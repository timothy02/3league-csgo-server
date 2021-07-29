import { ipcMain } from 'electron';
import db from '../db/index';
import { IPCCommunicationCommands, IPCSteamCMDCommands } from './protocol';

import './steamcmd';

ipcMain.on(IPCCommunicationCommands.REQUEST_SERVER_STATUSES, async (event) => {
    console.log(IPCCommunicationCommands.REQUEST_SERVER_STATUSES);
    const serverId = await db.Session.getDefaultServerId();
    const server = await db.Servers.findOne(serverId);

    const statuses = server.installStatuses;

    for(const status of statuses){
        event.reply(status.protocol, status.status);
    }
});