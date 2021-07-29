interface ServerInfo {
    _id: string;
    default: boolean;
}

export interface Session {
    servers: Array<object> | null;
}

export const sessionSchema = {
    type: 'object',
    properties: {
        servers: {
            type: ['array', 'null'],
            default: [] as ServerInfo[]
        }
    },
    required: ["servers"]
}