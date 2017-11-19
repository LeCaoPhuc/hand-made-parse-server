Parse.Cloud.useMasterKey();
var utils = require('./utils');
moment = require('moment');
mailer = require('nodemailer');
tools = require('./tools');
errorConfig = require('../config/error-config')

Parse.Cloud.define('getMaterialList', function (req, res) {
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
            }
            else {
                limit = parseInt(limit);
                page = parseInt(page);
                if (page < 1) {
                    tools.error(req, res, 'page must be larger than 0', errorConfig.ERROR_PARAMS);
                    return;
                }
            }
            var query = new Parse.Query('Material');
            query.limit(limit);
            query.skip((page - 1) * limit);
            // query.descending("category_name");
            query.notContainedIn('status', ['delete', 'block']);
            query.find({
                success: function (results) {
                    tools.success(req, res, 'get material list successfully', results);
                },
                error: function (error) {
                    tools.error(req, res, 'error get list material', error, errorConfig.ACTION_FAIL);
                }
            });
        })
        .catch(function (err) {
            tools.error(req, res, 'you are not admin', errorConfig.NOT_FOUND, err);
        })
});

Parse.Cloud.define('getMaterial', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var materialId = req.params.materialId;
            var materialQuery = new Parse.Query('Material');
            materialQuery.notContainedIn('status', ['delete', 'block']);
            return materialQuery.get(materialId, { useMasterKey: true });
        })
        .then(function (material) {
            tools.success(req, res, 'Get material success', material);
        })
        .catch(function (err) {
            tools.error(req, res, 'Get material error', err);
        })
});

Parse.Cloud.define('saveMaterial', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var id = req.params.id;
            var name = req.params.name;
            var description = req.params.description;
            if (!name) {
                tools.error(req, res, 'name was not undefine', errorConfig.REQUIRE);
                return;
            }
            var Material = new Parse.Object.extend('Material');
            var material = new Material();
            if (id) { //craete
                material.id = id;
                material.set('material_name', name);
                material.set('description', description);
            } else {//update
                if (name)
                    material.set('material_name', name);
                if (description)
                    material.set('description', description);
            }
            material.save(null)
                .then(function (result) {
                    tools.success(req, res, 'save material success', result);
                })
                .catch(function (err) {
                    tools.error(req, res, 'error catch save material', errorConfig.ACTION_FAIL, err);
                })
        })
        .catch(function (err) {
            tools.error(req, res, 'you are not admin', errorConfig.NOT_FOUND, err);
        })
});

Parse.Cloud.define('deleteMaterial', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var materialId = req.params.materialId;
            var materialId = req.params.materialId;
            var materialQuery = new Parse.Query('Material');
            materialQuery.notEqualTo('status', 'delete');
            var currentDate = new Date();
            return materialQuery.get(materialId, { useMasterKey: true });
        })
        .then(function (material) {
            material.set('status', 'delete');
            return material.save(null, { useMasterKey: true });
        })
        .then(function (material) {
            tools.success(req, res, 'Delete material success');
        })
        .catch(function (err) {
            tools.error(req, res, 'you are not admin', errorConfig.NOT_FOUND, err);
        })
});