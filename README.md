## Chadwick Bureau Baseball Databank to MongoDB Utility
[Chadwick Bureau Baseball Databank](https://github.com/chadwickbureau/baseballdatabank "Chadwick Bureau Baseball Databank").

[GitHub](https://github.com/mswilson4040/chadwick-to-mongo "GitHub").

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

    


This will clone the Chadwick Bureau Baseball Databank Repository locally. Then, it will find the existing database and drop it. Once it's dropped, it will convert all the csv files to json and create the database and it's collections accordingly.


