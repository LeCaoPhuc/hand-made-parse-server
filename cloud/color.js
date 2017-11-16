Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')

Parse.Cloud.define('getColorList', function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var limit = req.params.limit;
    var page = req.params.page;
    if(!limit || !page) {
        tools.error(req,res, 'params was not undefine', errorConfig.REQUIRE);
        return;
    }
    else {
        limit = parseInt(limit);
        page = parseInt(page);
        if(page < 1) {
            tools.error(req,res, 'page must be larger than 0', errorConfig.ERROR_PARAMS);
            return;
        }
    }
    var query = new Parse.Query('Color');
    query.limit(limit);
    query.skip((page-1)*limit);
    // query.descending("category_name");
    query.notContainedIn('status', ['delete','block']);
    query.find({
        success: function(results) {
            tools.success(req, res, 'get color list successfully', results);
        },
        error: function(error) {
            tools.error(req, res, 'error get list color',error, errorConfig.ACTION_FAIL);
        }
    });
})

Parse.Cloud.define('saveColor',function(req,res) {
    var id = req.params.id;
    var name = req.params.name;
    var code = req.params.code;
    if(!req.user) {
        tools.notLogin(req,res);
    }
    if(!name || !code) {
        tools.error(req,res,'name and code was not undefine',errorConfig.REQUIRE);
        return;
    }
    if(code.substr(0,1) != '#') {
        code = '#' + code;
    }
    if(!id) { //craete
        var Color = new Parse.Object.extend('Color');
        var color = new Color();
        color.set('color_name',name);
        color.set('color_code',code);
        color.save(null)
        .then(function(result){
            tools.success(req,res,'create color success', result);
        })
        .catch(function(err){
            tools.error(req,res,'error catch save create color',errorConfig.ACTION_FAIL,err)
        })
    }
    else {//update
        var queryColor = new Parse.Query('Color');
        queryColor.notEqualTo('status', 'delete');
        queryColor.get(id)
        .then(function(result){
            result.set('color_name',name);
            result.set('color_code',code);
            result.save(null)
            .then(function(results){
                tools.success(req,res,'create color success', results);
            })
            .catch(function(err){
                tools.error(req,res,'error catch save update color',errorConfig.ACTION_FAIL,err)
            })
        })
        .catch(function(err){
              tools.error(req,res,'error catch get color',errorConfig.ACTION_FAIL,err)
        })
    }
})