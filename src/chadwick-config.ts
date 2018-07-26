export interface IChadwickConfig {
    mongoPath: string;
    directoryName: string;
    databaseName: string;
}

export class ChadwickConfig implements IChadwickConfig {
    public mongoPath: string;
    public directoryName: string;
    public databaseName: string;
    constructor(_mongoPath?: string, _directoryName?: string, _databaseName?: string) {
        this.mongoPath = _mongoPath || 'mongodb://localhost:27017';
        this.directoryName = _directoryName || 'chadwick';
        this.databaseName = _databaseName || 'chadwick';
    }
}