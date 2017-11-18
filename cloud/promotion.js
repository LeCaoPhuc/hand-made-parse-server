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
            promotionQuery.notEqualTo('status', 'delete');
            var currentDate = new Date();
            promotionQuery.greaterThanOrEqualTo('end_date', currentDate);
            return promotionQuery.find({ useMasterKey: true });
        })
        .then(function (listPromotion) {
            tools.success(req, res, 'Get promotion list success', listPromotion);
        })
        .catch(function (err) {
            tools.error(req, res, 'Get promotion list eror', err);
        })
})

Parse.Cloud.define('savePromotion', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var percent = req.params.percent;
            var startDay = req.params.startDay;
            var endDay = req.params.endDay;
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
                promotion.set('percent', percent);
                promotion.set('start_date', startDay);
                promotion.set('end_date', endDay);
                if (description)
                    promotion.set('description', description);
            }
            else {
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
})