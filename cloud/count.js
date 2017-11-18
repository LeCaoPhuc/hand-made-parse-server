Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')

Parse.Cloud.define('countObject',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var className = req.params.className;
    if(!className) {
        tools.error(req,res,'className was not undefine', errorConfig.REQUIRE);
        return;
    }
    var query = new Parse.Query(className);
    if(className == 'User'){
        query.notEqualTo('user_type','admin');
    }
    query.notEqualTo("status", "delete");
    query.count()
    .then(function(result){
        res.success(result);
    })
    .catch(function(err){
        tools.error(req,res,'error catch countObject',errorConfig.ACTION_FAIL,err);
    })
})
