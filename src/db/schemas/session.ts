export interface Session {
    servers: Array<object>;
}

export const sessionSchema = {
    type: 'object',
    properties: {
        servers: {
            type: 'array',
            default: [] as object[]
        }
    },
    required: ["servers"]
}