Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')

Parse.Cloud.define('createProduct',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
    }
    
})
