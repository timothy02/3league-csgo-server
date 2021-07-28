import Datastore from "nedb-promises";
import Ajv from 'ajv';

export interface StoreConfig {
    name: string,
    schema: object,
}

export class Store<StoreType>{
    schemaValidator: Function;
    db: any;
    dbPath: string;

    constructor(config: StoreConfig){
        const ajv = new Ajv({
            allErrors: true,
            useDefaults: true
        });

        this.schemaValidator = ajv.compile(config.schema);
        
        this.dbPath = `${process.cwd()}/${config.name}.db`;

        this.db = Datastore.create({
            filename: this.dbPath,
            timestampData: true,
        });
    }

    validate(data: StoreType){
        return this.schemaValidator(data);
    }
    
    async create(data: StoreType) {
        const isValid = this.validate(data);
        if (isValid) {
            return await this.db.insert(data);
        }
    }

    async findOne(_id: string | number) {
        return await this.db.findOne({_id}).exec();
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