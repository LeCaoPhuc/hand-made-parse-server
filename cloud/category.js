Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')

Parse.Cloud.define('getCategoryList', function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var query = new Parse.Query('Category');
    var limit = req.params.limit;
    var page = req.params.page;
    var isAdmin = req.params.isAdmin;
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
        if(limit < 1) {
            tools.error(req,res, 'limit must be larger than 0', errorConfig.ERROR_PARAMS);
            return;
        }
    }
    query.notContainedIn('status', ['delete']);
    if(!isAdmin) {
        query.notEqualTo('count_product',0);
    }
    query.addAscending('category_name');
    query.limit(limit);
    query.skip((page-1)*limit);
    query.find({
        success: function(results) {
            tools.success(req, res, 'get category list successfully', results);
        },
        error: function(error) {
            tools.error(req, res, 'error get list category',error, errorConfig.ACTION_FAIL);
        }
    });
})

Parse.Cloud.define('saveCategory',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var id = req.params.id;
    var image = req.params.image;
    var name = req.params.name;
    var productCount = req.params.productCount;
    var Category = new Parse.Object.extend('Category');
    var category = new Category();
    if(id) { //update
        category.id = id;
        if(name) {
            category.set('category_name',name);
        }
        if(image) {
             category.set('image',image);
        }
         if(productCount) {
             category.set('count_product',productCount);
        }
        else {
            category.set('count_product',0);
        }
    }
    else {//created
        if(!name || !image) {
            tools.error(req,res,'name was not undefine',errorConfig.REQUIRE);
            return;
        }
        category.set('category_name',name);
        category.set('image',image);
        if(productCount) {
             category.set('count_product',productCount);
        }
        else {
            category.set('count_product',0);
        }
    }
    category.save(null)
    .then(function(result){
        tools.success(req,res,'save category success', result);
    })
    .catch(function(err) {
        tools.error(req,res,'error catch save category',errorConfig.ACTION_FAIL,err);
    })
})

Parse.Cloud.define('getCategoryWithId',function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var id = req.params.id;
    if(!id) {
        tools.error(req,res,'id was not undefine',errorConfig.REQUIRE);
        return;
    }
    var query = new Parse.Query('Category');
    query.notEqualTo('status','delete');
    query.get(id, {useMasterKey: true})
    .then(function(response){
        if(response) {
            tools.success(req,res,'get category success',response);
        }
    })
    .catch(function(err){
        tools.error(req,res,'fail inside catch',errorConfig.ACTION_FAIL,err);
    })
})