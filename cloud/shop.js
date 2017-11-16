Parse.Cloud.useMasterKey();
var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    tools = require('./tools');
    errorConfig = require('../config/error-config')

Parse.Cloud.define('getShopInfo',function(req,res) {
    if(!req.user){
        tools.notLogin(req,res);
    }
    var query = new Parse.Query('Shop');
    query.notContainedIn('status',['block','delete']);
    query.find()
    .then(function (shops) {
        if (shops && shops.length > 0){
            tools.success(req,res,'get user info success',shops[0]);
        }
        else {
            tools.error(req,res,'shop not found',errorConfig.NOT_FOUND);
        }
    }).catch(function (err) {
        console.log('-getShopInfo');
        tools.error(req,res,'error get shop info catch', err, errorConfig.ACTION_FAIL.code);
    })
})

Parse.Cloud.define('saveShop',function(req,res){
    if(!req.user) {
        tools.notLogin(req,res);
    }
    var shopName = req.params.shopName;
    var address = req.params.address;
    var phoneNumber = req.params.phoneNumber;
    var description = req.params.description;
    var latitude = req.params.latitude;
    var longitude = req.params.longitude;
    var timeOpen = req.params.timeOpen;
    var id = req.params.id;
    var user = req.user;
    if(!shopName || !address || !phoneNumber || !latitude || !longitude) {
        tools.error(req,res,'some property undefine',errorConfig.REQUIRE);
        return;
    }
    else {
        if(user.get('user_type')!='admin'){
            tools.error(req,res,'you have not permission',errorConfig.ACTION_FAIL);
            return;
        }
        var Shop = Parse.Object.extend("Shop");
        var shop = new Shop();
        if(id) {
            shop.id = id;
            shop.set('shop_name', shopName);
            shop.set('shop_phone_number', phoneNumber);
            shop.set('shop_address', address),
            shop.set('latitude',latitude);
            shop.set('longitude',longitude);
            shop.set('time_open',timeOpen);
            shop.set('shop_owner',user);
            if(description) shop.set('shop_description', description);
        }
        else {
            shop.set('shop_name', shopName);
            shop.set('shop_phone_number', phoneNumber);
            shop.set('shop_address', address);
            shop.set('time_open',timeOpen);
            shop.set('latitude',latitude);
            shop.set('longitude',longitude);
            if(description) shop.set('shop_description', description);
        }
        shop.save(null,{
            success: function(shop) {
                tools.success(req,res,'create shop success',shop);
            },
            error: function(gameScore, error) {
                tools.error(req,res,'create shop fail', error,errorConfig.ACTION_FAIL.code);
            }
        })
    }  
})


function checkShopExists(shopName) {
    return new Promise(function (resolve, reject) {
        if(!shopName) {
            resolve();
            return;
        }
        var query = new Parse.Query('Shop');
        query.equalTo('shop_name', shopName);
        query.notEqualTo('status','delete');
        query.first()
        .then(function (shop) {
            if (shop) resolve(shop);
            else resolve();
        }).catch(function (err) {
            console.log('-checkUserExists');
            reject();
        })
    })
}
