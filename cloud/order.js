Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')
Parse.Cloud.define('getOrderList', function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
    }
    var user = req.user;
    var type = req.params.type;
    if(!type) {
        tools.error(req, res, 'type is undefine', errorConfig.REQUIRE);
    }
    var query = new Parse.Query('')
})

Parse.Cloud.define('order', function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var user = req.user;
    var address = req.params.address;
    var items = req.params.items;
    // if(!address || (address && (!address.telephone || !address.firstname || !address.lastname || !address.city))) {
    //     tools.error(req, res, 'address or any property is undefine', errorConfig.REQUIRE);
    //     return;
    // }
    // if(!items || (items && items.length ==0)){
    //      tools.error(req, res, 'items empty or undefine', errorConfig.REQUIRE);
    //     return;
    // }
    // var Order = Parse.Object.extend("Order");
    // var order = new Order();
    // order.set('')
    // var query = new Parse.Query('')
    autoCreateOrderNumber(shop)
    .then(function(res){
      console.log(res);  
    })
    .catch(function(err){
        console.log(err);
    })
})

function autoCreateOrderNumber(user) {
    return new Promise(function(resolve, reject) {
        var query = new Parse.Query('Order');
        query.equalTo('shop', user);
        query.descending('order_number');
        query.first()
        .then(function(order) {
            if(order) {
                var orderNumber  = parseInt(order.get('order_number'));
                var newOderNumber = orderNumber + 1;
                var newOrderNumberString = '';
                if(newOderNumber <= 9) {
                    newOrderNumberString = '0000' + newOderNumber;
                }
                else {
                    if(newOderNumber <= 99) {
                         newOrderNumberString = '000' + newOderNumber;
                    }
                    else {
                        if(newOderNumber <= 999) {
                            newOrderNumberString = '00' + newOderNumber;
                        }
                        else {
                            if(newOderNumber <= 9999) {
                                newOrderNumberString = '0' + newOderNumber;
                            }
                            else {
                                newOrderNumberString = newOderNumber + ''
                            }
                        }
                    }
                }
                resolve(newOrderNumberString);
            }
            else {
                var newOrderNumberString = '00001';
                reject();
            }
        })
        .catch(function(err){
             reject(err);
        })
    })
}