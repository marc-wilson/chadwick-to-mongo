## Chadwick Bureau Baseball Databank to MongoDB Utility
[Chadwick Bureau Baseball Databank](https://github.com/chadwickbureau/baseballdatabank "Chadwick Bureau Baseball Databank").

[GitHub Repo](https://github.com/mswilson4040/chadwick-to-mongo "GitHub Repo").

`chadwick-to-mongo` is a utility for taking the Chadwick Bureau Baseball Databank repo and converting it into a MongoDB Database.
This utility will take in a config (mongo db path, a directory name for whatever you want to call the downloaded repo, and a
name in which you want the database to be called). The config is optional. If you do not pass in a config, it will use default values:

       mongoPath: 'mongodb://localhost:27017'
       directoryName: 'chadwick'
       databaseName: 'chadwick'

In addition, while the utility it creating the MongoDB Collections, it will go ahead and index obvious fields such as `playerID`, `teamID`, `yearID`
and a text index for a players full name (in the `people` collection).

Pull requests, bugs, features and general questions are welcome.

### Install

`npm install chadwick-to-mongo --save`


### Usage

##### With a config
    

    import { ChadwickConfig, ChadwickToMongo } from 'chadwick-to-mongo/lib';
    
    const config = new ChadwickConfig('mongodb://localhost:27017', 'chadwick', 'chadwick');
    const ctm = new ChadwickToMongo(config);
    ctm.init();
    
##### Without a config
    

    import { ChadwickConfig, ChadwickToMongo } from 'chadwick-to-mongo/lib';
    
    const ctm = new ChadwickToMongo();
    ctm.init();

    





