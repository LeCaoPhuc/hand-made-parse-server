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
    tools.checkAdmin(req.user)
    .then(function(result){
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
    .catch(function(err){
        tools.error(req,res, 'you are not admin', errorConfig.NOT_FOUND,err);
    })
})