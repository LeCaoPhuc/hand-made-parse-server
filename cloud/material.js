Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')

Parse.Cloud.define('getMaterialList', function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var limit = req.params.limit;
    var page = req.params.page;
    if(!limit || !page) {
        tools.error(req,res, 'params was not undefine', errorConfig.REQUIRE);
    }
    else {
        limit = parseInt(limit);
        page = parseInt(page);
        if(page < 1) {
            tools.error(req,res, 'page must be larger than 0', errorConfig.ERROR_PARAMS);
            return;
        }
    }
    var query = new Parse.Query('Material');
    query.limit(limit);
    query.skip((page-1)*limit);
    // query.descending("category_name");
    query.notContainedIn('status', ['delete','block']);
    query.find({
        success: function(results) {
            tools.success(req, res, 'get material list successfully', results);
        },
        error: function(error) {
            tools.error(req, res, 'error get list material',error, errorConfig.ACTION_FAIL);
        }
    });
})

Parse.Cloud.define('saveMaterial',function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
    }
    var id = req.params.id;
    var name = req.params.name;
    if(!name) {
        tools.error(req,res,'name was not undefine',errorConfig.REQUIRE);
        return;
    }
    var Materrial = new Parse.Object.extend('Material');
    var material = new Materrial();
    if(id) { //craete
        material.id = id;
        material.set('material_name',name);
    }
    else {//update
        if(name)
            material.set('material_name',name);
    }
    material.save(null)
    .then(function(result){
        tools.success(req,res,'save material success', result);
    })
    .catch(function(err) {
        tools.error(req,res,'error catch save material',errorConfig.ACTION_FAIL,err);
    })

})