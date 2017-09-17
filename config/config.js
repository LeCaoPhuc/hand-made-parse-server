var env = process.env.ENV || 'dev'
, path = require('path')
, configs = {};

configs.dev = {
    port: 1300,
    httpsPort: 1301,
    dashboardUsers: [{
        user: 'root',
        pass: 'r00t'
    }],
    parseServer: {
        databaseURI: 'mongodb://admin:Phuc4592603!@#@handmade-shard-00-00-jzqxp.mongodb.net:27017,handmade-shard-00-01-jzqxp.mongodb.net:27017,handmade-shard-00-02-jzqxp.mongodb.net:27017/test?ssl=true&replicaSet=Handmade-shard-0&authSource=admin',
        cloud: path.resolve('./cloud/main.js'),
        appId: process.env.APP_ID || 'hand-made-id',
        appName: 'HandMade.App',
        masterKey: 'hand-made-masterkey', //Add your master key here. Keep it secret!
        serverURL: process.env.SERVER_URL || `http://192.168.1.28:1300/parse`,  // Don't forget to change to https if needed
        // liveQuery: {
        //   classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
        // }
    },
    allowInsecureHttp: true
}

configs.local = {
    port: 3000,
    httpsPort: 3001,
    dashboardUsers: [{
        user: 'root',
        pass: 'r00t'
    }],
    parseServer: {
        databaseURI: 'mongodb://root:r00t@cluster0-shard-00-00-iogft.mongodb.net:27017,cluster0-shard-00-01-iogft.mongodb.net:27017,cluster0-shard-00-02-iogft.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
        cloud: path.resolve('./cloud/main.js'),
        appId: process.env.APP_ID || 'hand-made-id',
        appName: 'HandMade.App',
        masterKey: 'hand-made-masterkey', //Add your master key here. Keep it secret!
        serverURL: process.env.SERVER_URL || `http://localhost:3000/parse`,  // Don't forget to change to https if needed
        // liveQuery: {
        //   classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
        // }
    },
    allowInsecureHttp: true
}

module.exports = configs[env];