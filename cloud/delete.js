Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')

Parse.Cloud.define('deleteObject',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    tools.checkAdmin(req.user) 
    .then(function(result) {
        var className = req.params.className;
        var id = req.params.id ;
        if(!className || !id) {
            tools.error(req,res,'params was not undefine', errorConfig.REQUIRE);
            return;
        }
        var query = new Parse.Query(className);
        query.notEqualTo("status", "delete");
        query.get(id,{useMasterKey: true})
        .then(function(result){
            if(result) {
                result.set('status','delete')
                result.save(null,{useMasterKey: true})
                .then(function(response){
                    tools.success(req,res,'delete success',response);
                })
                .catch(function(err){
                    tools.error(req,res,'error catch delete',errorConfig.ACTION_FAIL,err);
                })
            }
        })
        .catch(function(err){
            tools.error(req,res,'error catch deleteObject getObject',errorConfig.ACTION_FAIL,err);
        })
    })
    .catch(function(err){
        tools.error(req,res,'error catch deleteObject getObject',errorConfig.ACTION_FAIL,err);
    })
})