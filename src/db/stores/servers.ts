import { Store } from './index';
import {Server, serverSchema} from "../schemas/server";

class ServerStore extends Store<Server>{
    constructor(name: string){
        super({
            name,
            schema: serverSchema
        });
    }
}

export default new ServerStore("servers");