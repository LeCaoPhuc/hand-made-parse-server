var config = require('../config/config');
function getUserById(userId) {
    var userQuery = new Parse.Query('User');
    return userQuery.get(userId);
}
function cloneUserInfo(user, fields, customFunction) {
    var userClone = new Parse.User();
    userClone.id = user.id;
    for (var i in fields) {
        userClone.set(fields[i], user.get(fields[i]));
    }
    var userCloneJSON = userClone.toJSON();
    userCloneJSON.id = userClone.id;
    userCloneJSON.className = userClone.className;
    if (customFunction) customFunction(userCloneJSON);
    userClone = Parse.Object.fromJSON(userCloneJSON);
    if (userClone.get('avatar')) userClone.get('avatar')._url = config.httpsDomain + userClone.get('avatar').url().split('parse')[1];
    return userClone;
}
function success(req, res, message, data) {
    var responseData = {
        success: true,
        message: message,
        data: data
    }
    if (req && req.params && req.params.timestamp)
        responseData.timestamp = req.params.timestamp;
    else
        responseData.timestamp = req.headers.timestamp;
    if (res) res.success(responseData);
    else return responseData;
}

function error(req, res, message, error, code) {
    var responseData = {
        success: false,
        message: message,
        error: error,
        code: code
    }
    if (req && req.params && req.params.timestamp)
        responseData.timestamp = req.headers.timestamp;
    else
        responseData.timestamp = req.headers.timestamp;
    if (res) {
        if (code) {
            res.error(code, responseData);
        } else {
            res.error(responseData);
        }
    }
    else return responseData;
}
function notLogin(res) {
    error(res, 'you are not login');
}
module.exports = {
    getUserById,
    cloneUserInfo,
    notLogin,
    error,
    success,
}