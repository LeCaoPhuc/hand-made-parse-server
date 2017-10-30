Parse.Cloud.useMasterKey();

var utils = require('./utils');
    moment = require('moment');
    mailer = require('nodemailer');
    query = new Parse.Query(Parse.User);
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
}); 
var successSendRequest = { 'code': 200, 'message': 'send mail successful' },
    successResetPass = { 'code': 200, "message": 'reset pass successful' };

var errorInsideManyUser = { code: 400, 'message': 'email inside many user' },
    errorUserNotFound = { code: 404, message: 'email not found' };

var generateCodeNotCorrect = { code: 401, 'message': 'generatecode is not correct' },
    expiredDateNotCorrect = { code: 401, 'message': 'expireddate  is expired' };

var mailHost = 'smtp.gmail.com',
    mailPort = 465,
    mailUser = 'lecaobaophuc@gmail.com',
    mailPass = '4592603537',
    mailFrom = '"LVAdmin" <lecaobaophuc@gmail.com>',
    mailSubject = '[LuanVan] Verify code',
    mailText = 'Your code confirm reset password: ';
var sendMail = function(email, code, date) {
    return new Promise(function(resolve, reject) {
        var smtpConfig = {
            host: mailHost,
            port: mailPort,
            secure: true,
            auth: {
                user: mailUser,
                pass: mailPass
            }
        };
        var transporter = mailer.createTransport(smtpConfig);
        var mailOptions = {
            from: mailFrom,
            to: email,
            subject: mailSubject,
            text: mailText + code
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                return console.log(error);
                reject(error);
            }
            query.equalTo("email", email);
            query.find({ useMasterKey: true }).then(function(result) {
                if (result.length === 1) {
                    var result = result[0];
                    result.set("generatecode", code);
                    result.set("expireddate", date);
                    result.save(null, { useMasterKey: true }).then(function(results) {
                        console.log(results);
                        resolve(successSendRequest);
                    }).catch(function(error) {
                        console.log('-sendMail');
                        reject(error);
                    })
                } else {
                    reject(errorInsideManyUser);
                }
            }).catch(function(error) {
                console.log('-sendMail');
                reject(error);
            });
        });
    });
};

Parse.Cloud.define("requestpassword", function(req, res) {
    var email = req.params.email;
    var code = utils.randomValueHex(6);
    var date = new Date(moment().utc().toDate().getTime() + 86400000);
    query.equalTo("email", email);
    query.find().then(function(result) {
        if (result.length === 1) {
            sendMail(email, code, date).then(function(result) {
                res.success(result);
            }).catch((error) => {
                console.log('-requestpassword');
                res.error(error);
            });
        } else if (result.length === 0) {
            res.error("Error");
        } else {
            res.error("Error");
        }
    }).catch(function(error) {
        console.log('-requestpassword');
        res.error(error);
    });
});

function checkUserExists(username) {
    return new Promise(function (resolve, reject) {
        var query = new Parse.Query('User');
        query.equalTo('username', username);
        query.first().then(function (user) {
            if (user) resolve(user);
            else reject();
        }).catch(function (err) {
            console.log('-checkUserExists');
            reject();
        })
    })
}