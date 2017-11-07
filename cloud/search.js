Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')
Parse.Cloud.define('searchWithName',function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var keyword = req.params.keyword;
    if(!(keyword && keyword.trim())) {
         tools.error(req,res,'keyword was not empty or undefine',errorConfig.REQUIRE);
    }
    var query = new Parse.Query('Product');
    query.notContainedIn('status',['delete','block']);
    query.contains('product_name', keyword);
    query.find()
    .then(function(results) {
         tools.success(req, res, 'search product success', results);
    })
    .catch(function(err) {
        tools.error(req,res, 'search product fail', errorConfig.ACTION_FAIL, err);
    })
})