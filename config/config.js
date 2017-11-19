var env = process.env.ENV || 'local'
, path = require('path')
, configs = {};
<<<<<<< HEAD
// var url = 'http://192.168.43.231:';
var url = 'http://192.168.1.157:';
=======
var url = 'http://192.168.1.129:';
// var url = 'http://192.168.1.157:';
>>>>>>> a1f3d8ec969f2b45b1c9a4e27f2ddddea5df105c
configs.dev = {
    
    port: 3000,
    httpsPort: 3000,
    dashboardUsers: [{
        user: 'root',
        pass: 'r00t'
    }],
    parseServer: {
        // databaseURI: 'mongodb://root:r00t@cluster0-shard-00-00-jzqxp.mongodb.net:27017,cluster0-shard-00-01-jzqxp.mongodb.net:27017,cluster0-shard-00-02-jzqxp.mongodb.net:27017/luanvan?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
        databaseURI: "mongodb://iamroot:%21%23%24%25%5E%26DFGHCVBerty789oijnbadmin@192.168.1.28/luanvan?authSource=admin&3t.uriVersion=2&3t.connectionMode=direct&readPreference=primary",
        cloud: path.resolve('./cloud/main.js'),
        appId: process.env.APP_ID || 'luan-van-app-id',
        appName: 'LuanVan.App',
        masterKey: 'luan-van-masterkey', //Add your master key here. Keep it secret!
        serverURL: process.env.SERVER_URL || url+`3000/parse`,  // Don't forget to change to https if needed
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
        // databaseURI : `mongodb://root:r00t@cluster0-shard-00-00-jzqxp.mongodb.net:27017,cluster0-shard-00-01-jzqxp.mongodb.net:27017,cluster0-shard-00-02-jzqxp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`,
        // databaseURI: 'mongodb://root:r00t@cluster0-shard-00-00-jzqxp.mongodb.net:27017,cluster0-shard-00-01-jzqxp.mongodb.net:27017,cluster0-shard-00-02-jzqxp.mongodb.net:27017/luanvan?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
        databaseURI: 'mongodb://127.0.0.1:27017/luanvan_local',
        cloud: path.resolve('./cloud/main.js'),
        appId: process.env.APP_ID || 'luan-van-app-id',
        appName: 'LuanVan.App',
        masterKey: 'luan-van-masterkey', //Add your master key here. Keep it secret!
        serverURL: process.env.SERVER_URL ||  url+`3000/parse`,  // Don't forget to change to https if needed
        // liveQuery: {
        //   classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
        // }
    },
    allowInsecureHttp: true
}

module.exports = configs[env];