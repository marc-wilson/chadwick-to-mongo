import { MongoClient } from 'mongodb';
import * as fs from 'fs-extra';

class ChadwickToMongo {
    private readonly MONGODB_PATH = 'mongodb://localhost:27017';
    private readonly INDEX_COLUMNS: string[];
    private _csv = require('csvtojson');
    public _download = require('download-git-repo');
    constructor() {
        this.init();
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
        const client = await MongoClient.connect(`${this.MONGODB_PATH}`);
        return client;
    }
    async removeRepo(): Promise<void> {
        const dirExists = await fs.pathExists('chadwick');
        if (dirExists) {
            console.log('removing repo...');
            await fs.remove( 'chadwick' );
            console.log( 'removed repo' );
        } else {
            console.log( 'skipping removal of repo' );
        }
    }
    async cloneRepo(): Promise<boolean> {
        return new Promise<boolean>( async (resolve, reject) => {
            await this.removeRepo();
            console.log('cloning repo...');
            this._download('chadwickbureau/baseballdatabank', './chadwick', (err: any) => {
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
        const path = `chadwick/core/${collectionName}.csv`;
        const json = await this._csv().fromFile(path);
        data.data = this.fixTypes(json);
        return data;
    }
    async createDatabase(): Promise<void> {
        const files = await fs.readdir('chadwick/core');
        const collectionNames = files.filter( f => f.endsWith('.csv'))
            .map( f => f.toLowerCase().replace('.csv', ''));
        const client = await this.connect();
        const db = client.db('chadwick');
        console.log('creating database...');
        for (let collectionName of collectionNames) {
            const collectionObj = await this.convertCollectionToJson(collectionName);
            const collection = db.collection(collectionName);
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
                    nameFirst: 'text',
                    nameLast: 'text'
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
        const db = client.db('chadwick');
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

export { ChadwickToMongo }