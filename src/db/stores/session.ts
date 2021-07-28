import { Store } from './index';
import {Session, sessionSchema} from "../schemas/session";

export class SessionStore extends Store<Session>{
    constructor(name: string){
        super({
            name,
            schema: sessionSchema
        });
    }
}

export default new SessionStore("session");