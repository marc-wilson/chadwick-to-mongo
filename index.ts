import { MongoClient } from 'mongodb';
import 'nodegit';
import * as fs from 'fs-extra';
import 'csvtojson';

export class ChadwickToMongo {
    private readonly MONGODB_PATH = 'mongodb://localhost:27017';
    private _mongodb: MongoClient;
    private _git = require('nodegit');
    private _csv = require('csvtojson');
    constructor() {
        this._mongodb = require('mongodb').MongoClient;
        this.init();
    }
    async init(): Promise<void> {

        // TODO: Step 1: Clone Repo
        await this.cloneRepo();

        // TODO: Step 2: Drop Database
        await this.dropDatabase();

        // TODO: Step 3: Create Database
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
        }
        console.log('skipping removal of repo');
    }
    async cloneRepo(): Promise<void> {
        await this.removeRepo();
        console.log('cloning repo...');
        const repo = await this._git.Clone('https://github.com/chadwickbureau/baseballdatabank.git', './chadwick');
        console.log('repo cloned');
    }
    async convertCollectionToJson(collectionName: string): Promise<{ collectionName: string, data: object[] }> {
        const data: { collectionName: string, data: object[] } = { collectionName: collectionName, data: [] };
        const path = `chadwick/core/${collectionName}.csv`;
        const json = await this._csv().fromFile(path);
        console.log(json);
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
        collectionNames.forEach( async c => {
            const collectionObj = await this.convertCollectionToJson(c);
            const collection = db.collection(c);
            await collection.insertMany(collectionObj.data);
        });
        console.log('Finished creating database');
        await client.close();
    }
    async dropDatabase(): Promise<void> {
        console.log('dropping database');
        const client = await this.connect();
        const db = client.db('chadwick');
        await db.dropDatabase();
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
}

export default new ChadwickToMongo();