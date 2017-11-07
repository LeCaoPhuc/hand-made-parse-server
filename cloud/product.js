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
Parse.Cloud.define('getProductListWithCategory',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
    }
    var categoryId = req.params.categoryId;
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
    if(!categoryId) {
         tools.error(req,res, 'categoryId was not undefine', errorConfig.REQUIRE);
         return;
    }
    var category = new Parse.Object('Category');
    category.id = categoryId;
    var query = new Parse.Query('Product');
    query.equalTo('category',category);
    query.notContainedIn('status',['delete','block']);
    query.include('product_detail_display');
    query.limit(limit);
    query.skip((page-1)*limit);
    query.find()
    .then(function(results){
        tools.success(req, res, 'get product list success', results);
    })
    .catch(function(err){
        tools.error(req, res, 'get product list fail', errorConfig.ACTION_FAIL, err);
    })
})

// Parse.Cloud.define('getNewProductList',function(req,res){
//     if(!req.user) {
//         tools.notLogin(req,res);
//     }
//     var limit = req.params.limit;
//     var page = req.params.page;
//     if(!limit || !page) {
//         tools.error(req,res, 'params was not undefine', errorConfig.REQUIRE);
//         return;
//     }
//     else {
//         limit = parseInt(limit);
//         page = parseInt(page);
//         if(page < 1) {
//             tools.error(req,res, 'page must be larger than 0', errorConfig.ERROR_PARAMS);
//             return;
//         }
//     }
//     var query = new Parse.Query('Product');
//     query.equalTo('category',category);
//     query.notContainedIn('status',['delete','block']);
//     query.include('product_detail_display');
//     query.limit(limit);
//     query.skip((page-1)*limit);
//     query.find()
//     .then(function(results){
//         tools.success(req, res, 'get product list success', results);
//     })
//     .catch(function(err){
//         tools.error(req, res, 'get product list fail', errorConfig.ACTION_FAIL, err);
//     })
// })

