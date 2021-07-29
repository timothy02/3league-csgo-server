import Datastore from "nedb-promises";
import Ajv from 'ajv';
import path from 'path';

export interface StoreConfig {
    name: string,
    schema: object,
}

export class Store<StoreType>{
    schemaValidator: Function;
    db: any;
    dbPath: string;
    ajv: any;

    constructor(config: StoreConfig){
        const ajv = new Ajv({
            useDefaults: true
        });

        this.schemaValidator = ajv.compile<StoreConfig>(config.schema);
        this.ajv = ajv;
        
        this.dbPath = path.resolve(process.cwd(), "src/db/", config.name + ".db");

        this.db = Datastore.create({
            filename: this.dbPath,
            timestampData: true,
        });

        console.log(`Database ${config.name} initialized in ${this.dbPath}.`);
    }

    validate(data: StoreType){
        const validate = this.schemaValidator(data);
        // @ts-ignore
        if(!validate) console.log(this.schemaValidator.errors);
        return validate;
    }
    
    async create(data: StoreType) {
        const isValid = this.validate(data);
        if (isValid) {
            return await this.db.insert(data);
        } else {
            console.error("ERROR: Data not valid");
        }
    }

    async findOne(_id: string) {
        return await this.db.findOne({_id}).exec();
    }

    async update(_id: string, data: object){
        return await this.db.update({_id}, data);
    }

    async findBy(parameter: string, value: any) {
        let query:  {[parameter: string]: string} = {};
        query[parameter] = value;

        return await this.db.find(query).exec();
    }

    async readAll() {
        return await this.db.find();
    }

    async delete(_id: string | number) {
        return await this.db.remove({_id: _id}).exec();
    }
}