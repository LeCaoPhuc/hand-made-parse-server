Parse.Cloud.useMasterKey();

var utils = require('./utils');
moment = require('moment');
mailer = require('nodemailer');
errorConfig = require('../config/error-config')
tools = require('./tools');

Parse.Cloud.define('getPromotionList', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }

    tools.checkAdmin(req.user)
        .then(function (result) {
            var promotionQuery = new Parse.Query('Promotion');
            var page = req.params.page || 1;
            var limit = req.params.limit || 10;
            promotionQuery.skip((page - 1) * limit);
            promotionQuery.limit(limit);
            promotionQuery.notEqualTo('status', 'delete');
            return promotionQuery.find({ useMasterKey: true });
        })
        .then(function (listPromotion) {
            tools.success(req, res, 'Get promotion list success', listPromotion);
        })
        .catch(function (err) {
            tools.error(req, res, 'Get promotion list error', err);
        })
});

Parse.Cloud.define('getPromotion', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }

    tools.checkAdmin(req.user)
        .then(function (result) {
            var promotionId = req.params.promotionId;
            var promotionQuery = new Parse.Query('Promotion');
            promotionQuery.notEqualTo('status', 'delete');
            var currentDate = new Date();
            return promotionQuery.get(promotionId, { useMasterKey: true });
        })
        .then(function (promotion) {
            tools.success(req, res, 'Get promotion success', promotion);
        })
        .catch(function (err) {
            tools.error(req, res, 'Get promotion error', err);
        })
});

Parse.Cloud.define('savePromotion', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var name = req.params.name;
            var percent = req.params.percent;
            var startDay = req.params.startDate;
            var endDay = req.params.endDate;
            var description = req.params.description;
            var id = req.params.id;
            if (!percent || !startDay || !endDay) {
                tools.error(req, res, 'params was not undefine', errorConfig.REQUIRE);
                return;
            }
            if (!(startDay instanceof Date)) {
                startDay = new Date(startDay);
            }
            if (!(endDay instanceof Date)) {
                endDay = new Date(endDay);
            }
            var Promotion = new Parse.Object.extend('Promotion');
            var promotion = new Promotion();
            if (id) {
                promotion.id = id;
                promotion.set('name', name);
                promotion.set('percent', percent);
                promotion.set('start_date', startDay);
                promotion.set('end_date', endDay);
                if (description)
                    promotion.set('description', description);
            } else {
                promotion.set('name', name);
                promotion.set('percent', percent);
                promotion.set('start_date', startDay);
                promotion.set('end_date', endDay);
                if (description)
                    promotion.set('description', description);
            }
            promotion.save(null, { useMasterKey: true })
                .then(function (result) {
                    tools.success(req, res, 'save Promotion success', result);
                })
                .catch(function (err) {
                    tools.error(req, res, 'error catch save Promotion', errorConfig.ACTION_FAIL, err);
                })
        })
        .catch(function (err) {
            tools.error(req, res, 'you are not admin', errorConfig.NOT_FOUND, err);
        })
});

Parse.Cloud.define('deletePromotion', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var promotionId = req.params.promotionId;
            var promotionId = req.params.promotionId;
            var promotionQuery = new Parse.Query('Promotion');
            promotionQuery.notEqualTo('status', 'delete');
            var currentDate = new Date();
            return promotionQuery.get(promotionId, { useMasterKey: true });
        })
        .then(function (promotion) {
            promotion.set('status', 'delete');
            return promotion.save(null, { useMasterKey: true });
        })
        .then(function (promotion) {
            tools.success(req, res, 'Delete promotion success');
        })
        .catch(function (err) {
            tools.error(req, res, 'you are not admin', errorConfig.NOT_FOUND, err);
        })
});