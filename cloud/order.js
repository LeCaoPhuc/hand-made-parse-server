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
    var shopId = req.params.shopId || 'SVGHiY4qfA';
    var items = req.params.items;
    var totalPrice = 0;
    var orderNumber = '';
    var deliveyStatus = 'order';
    // if(!address || (address && (!address.telephone || !address.firstname || !address.lastname || !address.city))) {
    //     tools.error(req, res, 'address or any property is undefine', errorConfig.REQUIRE);
    //     return;
    // }
    // if(!items || (items && items.length ==0)){
    //      tools.error(req, res, 'items empty or undefine', errorConfig.REQUIRE);
    //     return;
    // }
    var productIdArr = [];
    for(var i= 0; i < items.length; i++) {
        productIdArr.push(items[i].id);
    }
    var shop = new Parse.Object("Shop");
    shop.id = shopId;
    autoCreateOrderNumber(shop)
    .then(function(orderNumber){
        orderNumber = orderNumber;
        var productQuery = new Parse.Query('ProductDetail');
        productQuery.containedIn('objectId',productIdArr);
        productQuery.notContainedIn('status', ['block','delete']);
        productQuery.include('promotion');
        productQuery.include('product');
        return productQuery.find()
    })
    .then(function(results){
        console.log(results);
        if(results && results.length > 0) {
            var Order = Parse.Object.extend("Order");
            var order = new Order();
            order.set('shop', shop);
            order.set('buyer',user);
            var arrOrderDetailQuery = [];
            for(var i = 0 ; i < results.length; i++) {
                var OrderDetail = Parse.Object.extend("OrderDetail");
                var orderDetail = new OrderDetail();
                orderDetail
            }
        }
        else {
            tools.error(req,res, 'product not found', errorConfig.NOT_FOUND);
        }
    })
    .catch(function(err){
        console.log(err);
    })
})

function autoCreateOrderNumber(shop) {
    return new Promise(function(resolve, reject) {
        var query = new Parse.Query('Order');
        query.equalTo('shop', shop);
        query.notEqualTo('status', 'delete');
        query.include('shop');
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
                resolve(newOrderNumberString);   
            }
        })
        .catch(function(err){
             reject(err);
        })
    })
}