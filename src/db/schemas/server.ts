export enum ServerInstallStatus{
    NOT_INSTALLED = "NOT_INSTALLED",
    STEAMCMD_INSTALLED = "STEAMCMD_INSTALLED",
    CSGO_INSTALLED = "CSGO_INSTALLED",
    MODS_INSTALLED = "MODS_INSTALLED",
}

export enum ServerStatus{
    NOT_READY = "NOT_READY",
    READY = "READY",
    RUNNING = "RUNNING",
    CONNECTED = "CONNECTED"
}

export interface Server{
    name: string;
    installStatus: ServerInstallStatus;
    status: ServerStatus;
    installDir: string;
}

export const serverSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
        },
        installStatus: {
            type: "string",
            default: ServerInstallStatus.NOT_INSTALLED,
        },
        status: {
            type: "string",
            default: ServerStatus.NOT_READY,
        }
    },
    required: ["name", "installStatus", "status", "installDir"]
}
