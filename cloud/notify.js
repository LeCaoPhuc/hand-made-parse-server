Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config');
Parse.Cloud.define('getNotifyList', function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var user = req.user;
    var query = new Parse.Query('Notify')
    query.equalTo('receiver', user);
    query.descending('createdAt');
    query.notEqualTo('status', 'delete');
    query.find() 
    .then(function(results){
        tools.success(req, res, 'get order list success', results);
    })
    .catch(function(err){
        tools.error(req, res, 'get order list fail', errorConfig.ACTION_FAIL, err);
    })
})

Parse.Cloud.define('sendNotify', function(req,res) {
     if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var username = req.params.username;
    var title = req.params.title;
    var content = req.params.content;
    if(!username || !title || !content) {
        tools.error(req,res,'username, title, content was not undefined',errorConfig.REQUIRE);
        return;
    }
    tools.checkAdmin(req.user)
    .then(function(result){
        checkUserExists(username)
        .then(function(existUser){
            if(existUser) {
                var Notify = new Parse.Object.extend('Notify');
                var notify = new Notify();
                notify.set('receiver',existUser);
                notify.set('content',content);
                notify.set('title',title);
                notify.save(null,{useMasterKey: true})
                .then(function(result) {
                    tools.success(req, res, 'save notify success',result);
                })
                .catch(function(err){
                    tools.error(req,res, 'error inside catch save notify', errorConfig.ACTION_FAIL);
                })
            }
            else {
                tools.error(req,res, 'object not found', errorConfig.NOT_FOUND);
            }
        })
        .catch(function(err){
            tools.error(req,res, 'error inside catch checkUSerEixt', errorConfig.ACTION_FAIL);
        })
    })
    .catch(function(err){
        tools.error(req,res, 'error inside catch checkAdmin', errorConfig.ACTION_FAIL);
    })
})
Parse.Cloud.define('viewNotify', function(req,res) {
     if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var id = req.params.id;
    if(!id) {
        tools.error(req,res,'id was not undefine',errorConfig.REQUIRE);
        return;
    }
   var Notify = new Parse.Object.extend('Notify');
   var notify = new Notify();
   notify.id = id;
   notify.set('viewed',true);
   notify.save(null,{useMasterKey: true})
   .then(function(result){
       tools.success(req,res,'change viewed success',result);
   })
    .catch(function(err){
        tools.error(req,res,'error iside catch viewNotify',err);
    })
})

function checkUserExists(username) {
    return new Promise(function (resolve, reject) {
        if (!username) {
            resolve();
            return;
        }
        var query = new Parse.Query('User');
        query.equalTo('username', username);
        query.notEqualTo('status','delete');
        query.first({useMasterKey: true}).then(function (user) {
            if (user) {
                resolve(user);
            }
            else {
                resolve();
            }
        }).catch(function (err) {
            console.log('-checkUserExists');
            reject();
        })
    })
}