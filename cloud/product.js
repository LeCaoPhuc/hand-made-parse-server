
Parse.Cloud.useMasterKey();
var utils = require('./utils');
moment = require('moment');
mailer = require('nodemailer');
tools = require('./tools');
errorConfig = require('../config/error-config')

Parse.Cloud.define('saveProduct', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var productName = req.params.product_name;
            var categoryId = req.params.category_id;
            var description = req.params.description;
            var status = req.params.status;
            var id = req.params.id
            if (!productName || !categoryId) {
                tools.error(req, res, 'params was not undefine', errorConfig.REQUIRE);
                return;
            }
            var productResult;
            var Product = new Parse.Object.extend('Product');
            var product = new Product();
            var category = new Parse.Object('Category');
            category.id = categoryId;
            if (id) { //update
                product.id = id;
                product.set('product_name', productName);
                product.set('category', category);
                product.set('product_description', description);
                product.set('status', status);
            }
            else { // create
                product.set('product_name', productName);
                product.set('category', category);
                product.set('product_description', description);
                product.set('status', status);
            }
            product.save(null, { useMasterKey: true })
                .then(function (result) {
                    productResult = product;
                    var query = new Parse.Query('ProductDetail');
                    query.notEqualTo('status', 'delete');
                    query.equalTo('product', result);
                    return query.find()
                    // tools.success(req,res,'save product success', result);
                })
                .then(function (results) {
                    var arrPromise = [];
                    if (results && results.length > 0) {
                        for (var i in results) {
                            results[i].set('category', category);
                            product.set('status', status);
                            arrPromise.push(results[i].save(null, { useMasterKey: true }))
                        }
                        return Promise.all(arrPromise)
                    }
                    else {
                        tools.success(req, res, 'save create product success', productResult);
                    }
                })
                .then(function (response) {
                    if (response) {
                        tools.success(req, res, 'save update product success', response);
                    }
                })
                .catch(function (err) {
                    tools.error(req, res, 'error in catch saveProduct', errorConfig.ACTION_FAIL, err);
                })
        })
        .catch(function (err) {
            tools.error(req, res, 'you are not admin', errorConfig.NOT_FOUND, err);
        })
})
Parse.Cloud.define('saveProductDetail', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    tools.checkAdmin(req.user)
        .then(function (result) {
            var productId = req.params.product_id;
            var categoryId = req.params.category_id;
            var colorId = req.params.color_id;
            var materialId = req.params.material_id;
            var promotonId = req.params.promotion_id;
            var image = req.params.image;
            var price = req.params.price;
            var sku = req.params.sku;
            var quantity = req.params.quantity;
            var status = req.params.status;
            var id = req.params.id;
            if (!productId || !categoryId || !image || !colorId || !materialId || !price || !quantity) {
                tools.error(req, res, 'params was not undefine', errorConfig.REQUIRE);
                return;
            }
            var ProductDetail = new Parse.Object.extend('ProductDetail');
            var productDetail = new ProductDetail();
            if (id) {
                productDetail.id = id;
                var color = new Parse.Object('Color');
                color.id = colorId;
                productDetail.set('color', color);
                var material = new Parse.Object('Material');
                material.id = materialId;
                productDetail.set('material', material);
                if (promotonId) {
                    var promotion = new Parse.Object('Promotion');
                    promotion.id = promotonId;
                    productDetail.set('promotion', promotion);
                }
                productDetail.set('image', image);
                productDetail.set('sku', sku);
                productDetail.set('price', price);
                productDetail.set('status', status);
                productDetail.set('quantity', quantity);
            }
            else {
                var product = new Parse.Object('Product');
                product.id = productId;
                productDetail.set('product', product);
                var category = new Parse.Object('Category');
                category.id = categoryId;
                productDetail.set('category', category);
                var color = new Parse.Object('Color');
                color.id = colorId;
                productDetail.set('color', color);
                var material = new Parse.Object('Material');
                material.id = materialId;
                productDetail.set('material', material);
                if (promotonId) {
                    var promotion = new Parse.Object('Promotion');
                    promotion.id = promotonId;
                    productDetail.set('promotion', promotion);
                }
                productDetail.set('image', image);
                productDetail.set('sku', sku);
                productDetail.set('price', price);
                productDetail.set('status', status);
                productDetail.set('quantity', quantity);
            }
            productDetail.save(null, { useMasterKey: true })
                .then(function (result) {
                    tools.success(req, res, 'save productDetail success', result);
                })
                .catch(function (err) {
                    tools.error(req, res, 'faild in catch saveProductDetail', errorConfig.ACTION_FAIL, err);
                })
        })
        .catch(function (err) {
            tools.error(req, res, 'you are not admin', errorConfig.NOT_FOUND, err);
        })
})
Parse.Cloud.define('getProductListWithCategory', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    var categoryId = req.params.categoryId;
    var limit = req.params.limit;
    var page = req.params.page;
    var withBlock = req.params.withBlock;
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
    // if(!categoryId) {
    //      tools.error(req,res, 'categoryId was not undefine', errorConfig.REQUIRE);
    //      return;
    // }
    var query = new Parse.Query('ProductDetail');
    if (categoryId) {
        var category = new Parse.Object('Category');
        category.id = categoryId;
        query.equalTo('category', category);
    }
    query.notContainedIn('status', ['delete', withBlock ? 'block' : undefined]);
    query.include('product');
    query.include('color');
    query.include('material');
    query.include('promotion');
    query.limit(limit);
    query.skip((page - 1) * limit);
    query.find()
        .then(function (results) {
            tools.success(req, res, 'get product list success', results);
        })
        .catch(function (err) {
            tools.error(req, res, 'get product list fail', errorConfig.ACTION_FAIL, err);
        })
})

Parse.Cloud.define('getCountProductWithCategory', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    var categoryId = req.params.categoryId;
    var query = new Parse.Query('ProductDetail');
    if (categoryId) {
        var category = new Parse.Object('Category');
        category.id = categoryId;
        query.equalTo('category', category);
    }
    query.notContainedIn('status', ['delete', 'block']);
    query.count()
        .then(function (results) {
            tools.success(req, res, 'count product list success', results);
        })
        .catch(function (err) {
            tools.error(req, res, 'count product list fail', errorConfig.ACTION_FAIL, err);
        })
})

Parse.Cloud.define('getProductDetailWithId', function (req, res) { // == search with SKU
    if (!req.user) {
        tools.notLogin(req, res);
        return;
    }
    var productId = req.params.id;
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
    if (!productId) {
        tools.error(req, res, 'id was not undefine', errorConfig.REQUIRE);
    }
    var product = new Parse.Object('Product');
    product.id = productId;
    var productDetailQuery = new Parse.Query('ProductDetail');
    productDetailQuery.limit(limit + 1); // increase 1 to cehck have more product
    productDetailQuery.skip((page - 1) * limit);
    productDetailQuery.equalTo('product', product);
    productDetailQuery.include('product');
    productDetailQuery.include('color');
    productDetailQuery.include('material');
    productDetailQuery.include('promotion');
    productDetailQuery.notContainedIn('status', ['delete', 'block']);
    productDetailQuery.find()
        .then(function (results) {
            if (results.length > limit) { // if results.length  > limit => have more product => last = false else last = true
                results.pop();
                tools.success(req, res, 'get product list success', results);
            }
            else {
                var last = true;
                tools.success(req, res, 'get product list success', results, last);
            }
        })
        .catch(function (err) {
            tools.error(req, res, 'get product detail fail', errorConfig.ACTION_FAIL, err);
        })
})

Parse.Cloud.define('getProductDetailWithSKU', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
        return;
    }
    var sku = req.params.sku;
    if (!sku) {
        tools.error(req, res, 'id was not undefine', errorConfig.REQUIRE);
    }
    var productDetailQuery = new Parse.Query('ProductDetail');
    productDetailQuery.equalTo('sku', sku);
    productDetailQuery.include('product');
    productDetailQuery.include('color');
    productDetailQuery.include('material');
    productDetailQuery.include('promotion');
    productDetailQuery.notContainedIn('status', ['delete', 'block']);
    productDetailQuery.find()
        .then(function (results) {
            tools.success(req, res, 'get product detail success', results);
        })
        .catch(function (err) {
            tools.error(req, res, 'get product detail fail', errorConfig.ACTION_FAIL, err);
        })
})

Parse.Cloud.define('getProductList', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    var categoryId = req.params.categoryId;
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
    var query = new Parse.Query('Product');
    if (categoryId) {
        var category = new Parse.Object('Category');
        category.id = categoryId;
        query.equalTo('category', category);
    }
    query.notContainedIn('status', ['delete']);
    query.limit(limit);
    query.skip((page - 1) * limit);
    query.find()
        .then(function (results) {
            tools.success(req, res, 'get product list success', results);
        })
        .catch(function (err) {
            tools.error(req, res, 'get product list fail', errorConfig.ACTION_FAIL, err);
        })
})

Parse.Cloud.define('getProductDetailById', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    var productId = req.params.productId;
    var query = new Parse.Query('Product');
    query.get(productId)
        .then(function (results) {
            tools.success(req, res, 'get product detail success', results);
        })
        .catch(function (err) {
            tools.error(req, res, 'get product detail fail', errorConfig.ACTION_FAIL, err);
        })
})

Parse.Cloud.define('getCountProduct', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
    }
    var categoryId = req.params.categoryId;
    var query = new Parse.Query('Product');
    if (categoryId) {
        var category = new Parse.Object('Category');
        category.id = categoryId;
        query.equalTo('category', category);
    }
    query.notContainedIn('status', ['delete', 'block']);
    query.count()
        .then(function (results) {
            tools.success(req, res, 'count product list success', results);
        })
        .catch(function (err) {
            tools.error(req, res, 'count product list fail', errorConfig.ACTION_FAIL, err);
        })
})

Parse.Cloud.define('deleteProductDetail', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
        return;
    }
    var query = new Parse.Query('ProductDetail');
    query.get(req.params.id).then(function (product) {
        if (product) {
            product.destroy().then(function () {
                tools.success(req, res, 'delete product detail success');
            }).catch(function (err) {
                tools.error(req, res, 'delete product detail error', err);
            })
        } else {
            tools.error(req, res, 'delete product detail error');
        }
    }).catch(function (err) {
        tools.error(req, res, 'delete product detail error', err);
    })
})

Parse.Cloud.define('deleteProduct', function (req, res) {
    if (!req.user) {
        tools.notLogin(req, res);
        return;
    }
    var query = new Parse.Query('Product');
    query.get(req.params.id).then(function (product) {
        if (product) {
            var productDetailQuery = new Parse.Query('ProductDetail');
            productDetailQuery.equalTo('product', product);
            productDetailQuery.find().then(function (products) {
                Parse.Object.destroyAll(products).then(function () {
                    product.destroy().then(function () {
                        tools.success(req, res, 'delete product detail success');
                    }).catch(function (err) {
                        tools.error(req, res, 'delete product detail error', err);
                    })
                }).catch(function (err) {
                    tools.error(req, res, 'delete product detail error', err);
                })
            }).catch(function (err) {
                tools.error(req, res, 'delete product detail error', err);
            })
        } else {
            tools.error(req, res, 'delete product detail error');
        }
    }).catch(function (err) {
        tools.error(req, res, 'delete product detail error', err);
    })
})