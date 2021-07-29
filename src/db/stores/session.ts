import { Store } from './index';
import {Session, sessionSchema} from "../schemas/session";
import { Server } from "../schemas/server";

export class SessionStore extends Store<Session>{
    constructor(name: string){
        super({
            name,
            schema: sessionSchema
        });
    }

    async getSession(){
        const sessions = await this.db.find();
        return sessions[0];
    }

    async setDefaultServer(serverId: string){
        const session = await this.getSession();

        return await this.update(session._id,
            {servers: [{
                _id: serverId,
                default:true
            }]}
            );
    }

    async getDefaultServerId(): Promise<string>{
        const session = await this.getSession();

        return session.servers[0]._id;
    }
}

export default new SessionStore("session");