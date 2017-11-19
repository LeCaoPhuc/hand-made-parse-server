Parse.Cloud.useMasterKey();
var utils = require('./utils');
moment = require('moment');
mailer = require('nodemailer');
tools = require('./tools');
errorConfig = require('../config/error-config')

Parse.Cloud.define('getColorList', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
        return;
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var limit = req.params.limit;
            var page = req.params.page;
            if (!limit || !page) {
                tools.error(req, res, 'params was not undefine', errorConfig.REQUIRE);
                return;
            }
            else {
                limit = parseInt(limit);
                page = parseInt(page);
                if (page < 1) {
                    tools.error(req, res, 'page must be larger than 0', errorConfig.ERROR_PARAMS);
                    return;
                }
            }
            var query = new Parse.Query('Color');
            query.limit(limit);
            query.skip((page - 1) * limit);
            // query.descending("category_name");
            query.notContainedIn('status', ['delete', 'block']);
            query.find({
                success: function (results) {
                    tools.success(req, res, 'get color list successfully', results);
                },
                error: function (error) {
                    tools.error(req, res, 'error get list color', error, errorConfig.ACTION_FAIL);
                }
            });
        })
        .catch(function (err) {
            tools.error(req, res, 'you are not admin', errorConfig.NOT_FOUND, err);
        })
})

Parse.Cloud.define('getColor', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var colorId = req.params.colorId;
            var colorQuery = new Parse.Query('Color');
            colorQuery.notContainedIn('status', ['delete', 'block']);
            return colorQuery.get(colorId, { useMasterKey: true });
        })
        .then(function (color) {
            tools.success(req, res, 'Get color success', color);
        })
        .catch(function (err) {
            tools.error(req, res, 'Get color error', err);
        })
});

Parse.Cloud.define('saveColor', function (req, res) {
    var id = req.params.id;
    var name = req.params.name;
    var code = req.params.code;
    var description = req.params.description;
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            if (!name || !code) {
                tools.error(req, res, 'name and code was not undefine', errorConfig.REQUIRE);
                return;
            }
            if (code.substr(0, 1) != '#') {
                code = '#' + code;
            }
            if (!id) { //craete
                var Color = new Parse.Object.extend('Color');
                var color = new Color();
                color.set('color_name', name);
                color.set('color_code', code);
                color.set('description', description);
                color.save(null)
                    .then(function (result) {
                        tools.success(req, res, 'create color success', result);
                    })
                    .catch(function (err) {
                        tools.error(req, res, 'error catch save create color', errorConfig.ACTION_FAIL, err)
                    })
            } else {//update
                var queryColor = new Parse.Query('Color');
                queryColor.notEqualTo('status', 'delete');
                queryColor.get(id)
                    .then(function (result) {
                        result.set('color_name', name);
                        result.set('color_code', code);
                        result.set('description', description);
                        result.save(null)
                            .then(function (results) {
                                tools.success(req, res, 'create color success', results);
                            })
                            .catch(function (err) {
                                tools.error(req, res, 'error catch save update color', errorConfig.ACTION_FAIL, err)
                            })
                    })
                    .catch(function (err) {
                        tools.error(req, res, 'error catch get color', errorConfig.ACTION_FAIL, err)
                    })
            }
        })
        .catch(function (err) {
            tools.error(req, res, 'you are not admin', errorConfig.NOT_FOUND, err);
        })
});

Parse.Cloud.define('deleteColor', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var colorId = req.params.colorId;
            var colorId = req.params.colorId;
            var colorQuery = new Parse.Query('Color');
            colorQuery.notEqualTo('status', 'delete');
            var currentDate = new Date();
            return colorQuery.get(colorId, { useMasterKey: true });
        })
        .then(function (color) {
            color.set('status', 'delete');
            return color.save(null, { useMasterKey: true });
        })
        .then(function (color) {
            tools.success(req, res, 'Delete color success');
        })
        .catch(function (err) {
            tools.error(req, res, 'you are not admin', errorConfig.NOT_FOUND, err);
        })
});