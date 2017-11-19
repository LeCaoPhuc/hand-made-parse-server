Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')
Parse.Cloud.define('getOrderList', function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var user = req.user;
    var isAdmin =  req.params.isAdmin
    var type = req.params.type;
    var limit = req.params.limit ? req.params.limit : 1000;
    var page = req.params.page ? req.params.page : 1;
    var query = new Parse.Query('Order')
    if(!isAdmin) {
        query.equalTo('buyer', user);
    }
    if(type == 'order') {
        query.equalTo('delivery_status', 'order');
    }
    else {
        if(type == 'bill') {
            query.equalTo('delivery_status', 'bill');
        }
    }
    query.descending('createdAt');
    query.notEqualTo('status', 'delete');
    query.include('buyer');
    query.limit(limit);
    query.skip((page-1)*limit);
    query.find({useMasterKey: true}) 
    .then(function(results){
        tools.success(req, res, 'get order list success', results);
    })
    .catch(function(err){
        tools.error(req, res, 'get order list fail', errorConfig.ACTION_FAIL, err);
    })
})
Parse.Cloud.define('getOrderDetail', function(req,res) {
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var user = req.user;
    var orderId = req.params.orderId;
    var orderResult ;
    if(!orderId) {
        tools.error(req, res, 'order id is undefine', errorConfig.REQUIRE);
        return;
    }
    var order = new Parse.Object('Order');
    order.id = orderId;
    var query = new Parse.Query('OrderDetail')
    query.equalTo('order', order);
    query.include('order');
    query.include('product_detail');
    query.notEqualTo('status', 'delete');
    query.find() 
    .then(function(results){ 
        var arrPromise = [];
        orderResult = results;
        for(var i = 0 ; i < results.length; i++) {
            var queryProductDetail = new Parse.Query('ProductDetail');
            queryProductDetail.notEqualTo('status', 'delete');
            queryProductDetail.include('product');
            queryProductDetail.include('color');
            queryProductDetail.include('material');
            queryProductDetail.include('promotion');
            arrPromise.push(queryProductDetail.get(results[i].get('product_detail').id, {useMasterKey: true}));
        }
        Promise.all(arrPromise)
        .then(function(result){
            var dataSuccess = []
            for(var i = 0 ; i < orderResult.length ; i++) {
                for(var j = 0; j < result.length; j++) {
                    if(result[j].id == orderResult[i].get('product_detail').id) {
                        dataSuccess.push({
                            order_detail :  orderResult[i],
                            product_detail: result[j]
                        })
                    }
                }
            }
            tools.success(req, res, 'get order detail success', dataSuccess);
        })
        .catch(function(err){
            tools.error(req, res, 'Promise All fail', errorConfig.ACTION_FAIL, err);
        })
    })
    .catch(function(err){
        tools.error(req, res, 'get order detail fail', errorConfig.ACTION_FAIL, err);
    })
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
    if(!address || (address && (!address.telephone || !address.name || !address.city))) {
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
            order.set('delivery_date', new Date());
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
                    orderDetail.set('quantity_buy', parseFloat(items[j].qty));
                    orderDetail.set('product_detail',productDetails[i]);
                    orderDetail.set('order',order);
                    if(productDetails[i].get('promotion')) {
                        var price = productDetails[i].get('promotion').get('percent')*productDetails[i].get('price');
                        orderDetail.set('unit_price', price);
                        orderDetail.set('total_price_product', price * parseFloat(items[j].qty))
                    }
                    else {
                        orderDetail.set('unit_price', productDetails[i].get('price'));
                        orderDetail.set('total_price_product', productDetails[i].get('price') * parseFloat(items[j].qty))
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
Parse.Cloud.define('changeDeliveryStatus',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    tools.checkAdmin(req.user)
    .then(function(result){
         var orderId = req.params.id;
        if(!orderId) {
            tools.error(req,res,'orderId was not undefine',errorConfig.REQUIRE);
        }
        var order;
        var orderDetailList ;
        var Order = new Parse.Query('Order');
        Order.get(orderId,{useMasterKey: true})
        .then(function(result){
            if(result) {
                order = result;
                var query = new Parse.Query('OrderDetail')
                query.include('product_detail');
                query.notEqualTo('status', 'delete');
                return query.find()
            }
        })
        .then(function(results){
            var arrPromise = [];
            orderDetailList = results;
            if(order.get('delivery_status')=='order'){
                for(var i in results) {
                    if(results[i].get('product_detail').get('quantity') < results[i].get('quantity_buy')) {
                        return new Promise(function(resolve,reject){
                            resolve({
                                success: true,
                                data: {
                                    quantity_buy: results[i].get('quantity_buy'),
                                    quantity_product: results[i].get('product_detail').get('quantity'),
                                    product_detail: results[i].get('product_detail')
                                },
                                message: errorConfig.ERROR_DATA
                            })
                            return;
                        })
                    } // if quantity in store < quantity buy
                    results[i].get('product_detail').set('quantity',results[i].get('product_detail').get('quantity')-results[i].get('quantity_buy'));
                    arrPromise.push(results[i].get('product_detail').save())
                }
            }
            else {
                for(var i in results) {
                    results[i].get('product_detail').set('quantity',results[i].get('product_detail').get('quantity') + results[i].get('quantity_buy'));
                    arrPromise.push(results[i].get('product_detail').save())
                }
            }
            return Promise.all(arrPromise)
        })
        .then(function(responseData){
            if(responseData && responseData.success) {
                responseData.success = false;
                res.success(responseData);
            }
            else {
                if(order.get('delivery_status')=='order') {
                        order.set('delivery_status','bill');
                        return order.save()
                }
                else {
                        order.set('delivery_status','order');
                        return order.save()
                }
            }
        })
        .then(function(data){ 
            if(data)
                tools.success(req,res,'update delivery status successfully',orderDetailList);
        })
        .catch(function(err){
            tools.error(req,res,'error catch changeDeliveryStatus',errorConfig.ACTION_FAIL,err);
        })
    })
    .catch(function(err){
        tools.error(req,res, 'you are not admin', errorConfig.NOT_FOUND,err);
    })
})
Parse.Cloud.define('countOrder',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var type = req.params.type;
    var query = new Parse.Query('Order')
    query.notEqualTo('status', 'delete');
    if(type == 'order') {
        query.equalTo('delivery_status', type);
    }
    else {
        if(type == 'bill') {
            query.equalTo('delivery_status', type);
        }
    }
    query.count() 
    .then(function(results){
        res.success(results);
    })
    .catch(function(err){
        tools.error(req, res, 'get order list fail', errorConfig.ACTION_FAIL, err);
    })
})
Parse.Cloud.define('getOrderWithId',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var orderId = req.params.id;
    if(!orderId) {
        tools.error(req, res, 'order id is undefine', errorConfig.REQUIRE);
        return;
    }
    var query = new Parse.Query('Order')
    query.notEqualTo('status', 'delete');
    query.include('buyer');
    query.get(orderId,{useMasterKey: true}) 
    .then(function(results){
       tools.success(req, res, 'get order detail success', results);
    })
    .catch(function(err){
        tools.error(req, res, 'get order list fail', errorConfig.ACTION_FAIL, err);
    })
})
Parse.Cloud.define('saveOrder',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var id = req.params.id;
    var delivery_date = req.params.delivery_date;
    if(!id) {
        tools.error(req, res, 'order id is undefine', errorConfig.REQUIRE);
        return;
    }
    tools.checkAdmin(req.user)
    .then(function(result){ 
        var Order = Parse.Object.extend("Order");
        var order = new Order();
        order.id = id;
        if(delivery_date) {
            order.set('delivery_date',delivery_date);
        }
        order.save(null,{useMasterKey: true})
        .then(function(results){
            tools.success(req,res,'save order success',results);
        })
        .catch(function(err){
             tools.error(req,res, 'error inside catch save', errorConfig.ACTION_FAIL,err);
        })
    })
    .catch(function(err){
        tools.error(req,res, 'you are not admin', errorConfig.NOT_FOUND,err);
    })
})
Parse.Cloud.define('deleteOrder',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
        return;
    }
    var id = req.params.id;
    if(!id) {
        tools.error(req, res, 'order id is undefine', errorConfig.REQUIRE);
        return;
    }
    tools.checkAdmin(req.user)
    .then(function(result){
        var Order = new Parse.Object.extend('Order');
        var order = new Order();
        order.id = id;
        var query = new Parse.Query('OrderDetail');
        query.equalTo('order',order);
        query.notEqualTo('status','delete');
        query.find({useMasterKey: true})
        .then(function(results){
            for(var i in results){
                results[i].set('status','delete')
            }
            Parse.Object.saveAll(results)
            .then(function(result){
                order.set('status','delete');
                order.save({useMasterKey: true})
                .then(function(response){
                     tools.success(req,res,'delete order success',result);
                })
                .catch(function(err){
                     tools.error(req,res, 'error inside catch save order', errorConfig.NOT_FOUND,err);
                })
            })
            .catch(function(err){
                tools.error(req,res, 'error inside catch saveAll', errorConfig.NOT_FOUND,err);
            })
        })
        .catch(function(err){
            tools.error(req,res, 'error inside catch find', errorConfig.NOT_FOUND,err);
        })
    })
    .catch(function(err){
        tools.error(req,res, 'you are not admin', errorConfig.NOT_FOUND,err);
    })
})
function autoCreateOrderNumber(shop) {
    return new Promise(function(resolve, reject) {
        var query = new Parse.Query('Order');
        query.notEqualTo('status', 'delete');
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

Parse.Cloud.define('updateOrderDetailQuantity', function (req, res) {
    var orderId = req.params.orderId;
    var quantity = req.params.quantity;
    var query = new Parse.Query('OrderDetail');
    query.get(orderId).then(function (orderDetail) {
        var prevTotalPrice = orderDetail.get('quantity_buy') * orderDetail.get('unit_price');
        orderDetail.set('quantity_buy', quantity);
        orderDetail.set('total_price_product', quantity * orderDetail.get('unit_price'));
        orderDetail.save().then(function (updateOrderDetail) {
            var currentTotalPrice = updateOrderDetail.get('quantity_buy') * updateOrderDetail.get('unit_price');
            // tools.success(req, res, 'Update quantity success', orderDetail);
            var orderQuery = new Parse.Query('Order');
            orderQuery.get(updateOrderDetail.get('order').id).then(function (order) {
                order.set('total_price', order.get('total_price') + (currentTotalPrice - prevTotalPrice));
                order.save().then(function () {
                    tools.success(req, res, 'Update quantity success', orderDetail);
                }).catch(function (err) {
                    tools.error(req, res, 'Update quantity error', err);
                })
            })

        }).catch(function (err) {
            tools.error(req, res, 'Update quantity error', err);
        })
    }).catch(function (err) {
        tools.error(req, res, 'Update quantity error', err);
    })
})

Parse.Cloud.define('deleteOrderDetailQuantity', function (req, res) {
    var orderId = req.params.orderId;
    var query = new Parse.Query('OrderDetail');
    query.get(orderId).then(function (orderDetail) {
        var prevTotalPrice = orderDetail.get('quantity_buy') * orderDetail.get('unit_price');
        orderDetail.destroy().then(function () {
            var orderQuery = new Parse.Query('Order');
            orderQuery.get(orderDetail.get('order').id).then(function (order) {
                var totalPrice = order.get('total_price') - prevTotalPrice;
                if (totalPrice <= 0) {
                    order.destroy().then(function (updateOrderDetail) {
                        tools.success(req, res, 'Update quantity success', orderDetail);
                    }).catch(function (err) {
                        tools.error(req, res, 'Update quantity error', err);
                    })
                } else {
                    order.set('total_price', totalPrice);
                    order.save().then(function (updateOrderDetail) {
                        tools.success(req, res, 'Update quantity success', orderDetail);
                    }).catch(function (err) {
                        tools.error(req, res, 'Update quantity error', err);
                    })
                }
            })
        })
    }).catch(function (err) {
        tools.error(req, res, 'Update quantity error', err);
    })
})