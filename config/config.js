var env = process.env.ENV || 'local'
, path = require('path')
, configs = {};

// configs.dev = {
//     port: 1300,
//     httpsPort: 1301,
//     dashboardUsers: [{
//         user: 'root',
//         pass: 'r00t'
//     }],
//     parseServer: {
//         databaseURI: 'mongodb://genad:Phuc4592603!@#@handmade-shard-00-00-jzqxp.mongodb.net:27017,handmade-shard-00-01-jzqxp.mongodb.net:27017,handmade-shard-00-02-jzqxp.mongodb.net:27017/test?ssl=true&replicaSet=Handmade-shard-0&authSource=admin',
//         cloud: path.resolve('./cloud/main.js'),
//         appId: process.env.APP_ID || 'hand-made-id',
//         appName: 'HandMade.App',
//         masterKey: 'hand-made-masterkey', //Add your master key here. Keep it secret!
//         serverURL: process.env.SERVER_URL || `http://192.168.1.28:1300/parse`,  // Don't forget to change to https if needed
//         // liveQuery: {
//         //   classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
//         // }
//     },
//     allowInsecureHttp: true
// }

configs.local = {
    port: 1310,
    httpsPort: 1311,
    dashboardUsers: [{
        user: 'root',
        pass: 'r00t'
    }],
    parseServer: {
        databaseURI: 'mongodb://genkadmin:123456@127.0.0.1:27017/genk?authSource=genk',
        cloud: path.resolve('./cloud/main.js'),
        appId: process.env.APP_ID || 'pnews-app-id',
        appName: 'Pnews.App',
        masterKey: 'pnews-masterkey', //Add your master key here. Keep it secret!
        serverURL: process.env.SERVER_URL || `http://192.168.1.143:1310/parse`,  // Don't forget to change to https if needed
        // liveQuery: {
        //   classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
        // }
    },
    allowInsecureHttp: true
}

module.exports = configs[env];