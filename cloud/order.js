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
    var deliveryStatus = 'order';
    var productDetails = [];
    var orderObject ;
    if(!address || (address && (!address.telephone || !address.firstname || !address.lastname || !address.city))) {
        tools.error(req, res, 'address or any property is undefine', errorConfig.REQUIRE);
        return;
    }
    if(!items || (items && items.length ==0)){
         tools.error(req, res, 'items empty or undefine', errorConfig.REQUIRE);
        return;
    }
    var productIdArr = [];
    for(var i= 0; i < items.length; i++) {
        productIdArr.push(items[i].id);
    }
    var shop = new Parse.Object("Shop");
    shop.id = shopId;
    autoCreateOrderNumber(shop)
    .then(function(orderNumberString){
        orderNumber = orderNumberString;
        var productDetailQuery = new Parse.Query('ProductDetail');
        productDetailQuery.containedIn('objectId',productIdArr);
        productDetailQuery.notContainedIn('status', ['block','delete']);
        productDetailQuery.include('promotion');
        productDetailQuery.include('product');
        return productDetailQuery.find()
    })
    .then(function(results){
        console.log(results);
        if(results && results.length > 0) {
            productDetails = results;
            var Order = Parse.Object.extend("Order");
            var order = new Order();
            order.set('shop', shop);
            order.set('buyer',user);
            order.set('delivery_address', address);
            order.set('delivery_status', deliveryStatus);
            order.set('order_number', orderNumber);
            for(var i = 0 ; i < results.length; i++) {
                if(results[i].get('promotion')) {
                    var price = results[i].get('promotion').get('percent')*results[i].get('price');
                    totalPrice += price;
                }
                else {
                    totalPrice += results[i].get('price');
                }
            }
            order.set('total_price',totalPrice);
            return order.save(null,{ useMasterKey: true })
        }
        else {
            tools.error(req,res, 'product not found', errorConfig.NOT_FOUND);
        }
    })
    .then(function(order){
        console.log(address.city);
        orderObject = order;
        var arrPromiseSaveOrderDetail = [];
        for(var i = 0 ; i < productDetails.length; i++) {
            for(var j = 0; j < items.length ; j++) {
                if(productDetails[i].id == items[j].id) {
                    var OrderDetail = Parse.Object.extend("OrderDetail");
                    var orderDetail = new OrderDetail();
                    orderDetail.set('quantity_buy', items[j].qty);
                    orderDetail.set('product_detail',productDetails[i]);
                    orderDetail.set('order',order);
                    if(productDetails[i].get('promotion')) {
                        var price = productDetails[i].get('promotion').get('percent')*productDetails[i].get('price');
                        orderDetail.set('unit_price', price);
                        orderDetail.set('total_price_product', price * items[j].qty)
                    }
                    else {
                        orderDetail.set('unit_price', productDetails[i].get('price'));
                        orderDetail.set('total_price_product', productDetails[i].get('price') * items[j].qty)
                    }
                    arrPromiseSaveOrderDetail.push(orderDetail.save(null,{useMasterKey : true }));
                }
            }
        }
        return Promise.all(arrPromiseSaveOrderDetail);
    })
    .then(function(arrOrderDetail){
        var response = {
            orderInfo : orderObject,
            items: arrOrderDetail
        };
        tools.success(req, res, 'order success', response);
    })
    .catch(function(err){
       tools.error(req, res, 'order fail in catch',errorConfig.ACTION_FAIL, err);
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