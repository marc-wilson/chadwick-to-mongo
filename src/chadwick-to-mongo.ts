import { MongoClient } from 'mongodb';
import * as fs from 'fs-extra';
import { ChadwickConfig } from './chadwick-config';

export interface IChadwickToMongo {
    config: ChadwickConfig;
    init(): Promise<void>;
    connect(): Promise<MongoClient>;
    removeRepo(): Promise<void>;
    cloneRepo(): Promise<boolean>;
    convertCollectionToJson(collectionName: string): Promise<{ collectionName: string, data: object[] }>;
    createDatabase(): Promise<void>;
    dropDatabase(): Promise<void>;
    fixTypes(json: object[]): object[];
    formatValue(val: any): any;
    getIndexColumns(data: object[]): any;
}

export class ChadwickToMongo implements IChadwickToMongo {
    private readonly INDEX_COLUMNS: string[];
    private _csv = require('csvtojson');
    public config: ChadwickConfig;
    public _download = require('download-git-repo');
    constructor(_config?: ChadwickConfig) {
        this.config = _config ? _config : new ChadwickConfig();
        this.INDEX_COLUMNS = [
            'playerID',
            'yearID',
            'teamID'
        ]
    }
    async init(): Promise<void> {

        // TODO: Step 1: Clone Repo
        await this.cloneRepo();

        // TODO: Step 2: Drop Database
        await this.dropDatabase();

        // TODO: Step 3: Create Database with Collections
        await this.createDatabase();

    }
    async connect(): Promise<MongoClient> {
        const client = await MongoClient.connect(`${this.config.mongoPath}`, { useNewUrlParser: true });
        return client;
    }
    async removeRepo(): Promise<void> {
        const dirExists = await fs.pathExists(this.config.directoryName);
        if (dirExists) {
            console.log('removing repo...');
            await fs.remove( this.config.directoryName );
            console.log( 'removed repo' );
        } else {
            console.log( 'skipping removal of repo' );
        }
    }
    async cloneRepo(): Promise<boolean> {
        return new Promise<boolean>( async (resolve, reject) => {
            await this.removeRepo();
            console.log('cloning repo...');
            this._download('chadwickbureau/baseballdatabank', `./${this.config.directoryName}`, (err: any) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log('repo cloned');
                    resolve(true);
                }
            });

        });
    }
    async convertCollectionToJson(collectionName: string): Promise<{ collectionName: string, data: object[] }> {
        const data: { collectionName: string, data: object[] } = { collectionName: collectionName, data: [] };
        const path = `${this.config.directoryName}/core/${collectionName}.csv`;
        const json = await this._csv().fromFile(path);
        data.data = this.fixTypes(json);
        return data;
    }
    async createDatabase(): Promise<void> {
        const files = await fs.readdir(`${this.config.directoryName}/core`);
        const collectionNames = files.filter( f => f.endsWith('.csv'))
            .map( f => f.toLowerCase().replace('.csv', ''));
        const client = await this.connect();
        const db = client.db(`${this.config.databaseName}`);
        console.log('creating database...');
        for (let collectionName of collectionNames) {
            const collectionObj = await this.convertCollectionToJson(collectionName);
            const collection = db.collection(collectionName);
            if (collectionName === 'people') {
                for (const record of collectionObj.data) {
                    record['fullName'] = `${record['nameFirst']} ${record['nameLast']}`;
                }
            }
            await collection.insertMany(collectionObj.data);
            const columnsToIndex = this.getIndexColumns(collectionObj.data);
            if (columnsToIndex) {
                console.log(`creating indexes for ${collectionName}...`);
                await collection.createIndex(columnsToIndex);
                console.log(`finished creating indexes for ${collectionName}`);
            }
            if (collectionName === 'people') {
                console.log(`creating text indexes for ${collectionName}...`);
                await collection.createIndex({
                    fullName: 'text'
                });
                console.log(`finished creating text indexes for ${collectionName}`);
            }
        }
        console.log('Finished creating database');
        await client.close();
    }
    async dropDatabase(): Promise<void> {
        console.log('dropping database');
        const client = await this.connect();
        const db = client.db(this.config.databaseName);
        await db.dropDatabase();
        await client.close();
        console.log('dropped database');
    }
    fixTypes(json: object[]): object[] {
        const data = json.map( (row: any) => {
            const newRow: any = {};
            for (let key in row) {
                if (row.hasOwnProperty(key)) {
                    const value = row[key];
                    newRow[key] = this.formatValue(value);;
                }
            }
            return newRow;
        });
        return data;
    }
    formatValue(val: any): any {
        if (val) {
            const numPattern = /^\d+$/;
            if (numPattern.test(val)) {
                return Number(val);
            } else {
                return val;
            }
        } else {
            return null;
        }
    }
    getIndexColumns(data: object[]): any {
        if (data) {
            const firstRecord = data[0];
            const columns: any = {};
            for ( const key in firstRecord ) {
                if ( firstRecord.hasOwnProperty( key ) ) {
                    const match = this.INDEX_COLUMNS.find( f => f === key );
                    if ( match ) {
                        columns[ key ] = 1;
                    }
                }
            }
            if ( Object.keys( columns ).length > 0 ) {
                return columns;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}