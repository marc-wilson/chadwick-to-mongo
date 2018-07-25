### Update

I am currently trying to get this packaged up into a proper module so that is more flexible and usable. It's just the whole demistifying webpack thing...


## Chadwick Bureau Baseball Databank to MongoDB Utility
[Chadwick Bureau Baseball Databank](https://github.com/chadwickbureau/baseballdatabank "Chadwick Bureau Baseball Databank").
[GitHub](https://github.com/mswilson4040/chadwick-to-mongo "GitHub").

### Run Script
1. Clone Repo
2. `npm install`
3. Start MongoDB Server
4. Compile TypeScript to JavaScript (`tsc`)
5. Run `node index.js`


This will clone the Chadwick Bureau Basenall Databank Repository locally. Then, it will find the existing database and drop it. Once it's dropped, it will convert all the csv files to json and create the database and it's collections accordingly.


