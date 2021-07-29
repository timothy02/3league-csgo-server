import { SteamCMDStatus, ServerStatus, IPCSteamCMDCommands } from "../../ipc/protocol";

export interface ServerStatusInfo {
    status: SteamCMDStatus;
    protocol: IPCSteamCMDCommands;
}

export interface Server{
    name: string;
    installStatuses: Array<ServerStatusInfo>;
    status: ServerStatus;
    installDir: string;
}

export const serverSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
        },
        installStatuses: {
            type: "array",
            default: [] as ServerStatusInfo[],
        },
        status: {
            type: "string",
            default: ServerStatus.NOT_READY,
        },
        installDir: {
            type: "string",
            default: ""
        }
    },
    required: ["name", "installStatuses", "status", "installDir"]
}
