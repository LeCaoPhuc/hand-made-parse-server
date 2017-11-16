var errorConfig = {
    REQUIRE : {
        code : 600,
        message : 'property require can not undefined'
    },
    NOT_FOUND: {
        code : 601,
        messgae : 'object not found'
    },
    INSIDE_MANY : {
        code : 602,
        messgae : 'inside many object'
    },
    EXIST : {
        code : 603,
        messgae : 'object is exist'
    } ,
    ACTION_FAIL : {
        code : 604,
        messgae : 'action fail inside catch'
    },
    ERROR_PARAMS : {
        code : 605,
        messgae : 'value of params os wrong'
    },
    ERROR_DATA : {
        code : 606,
        messgae : 'have wrong in data bond'
    }
};
module.exports = errorConfig;