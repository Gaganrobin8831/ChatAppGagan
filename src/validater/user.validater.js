const validator = require('validator');
const ResponseUtil = require('../utility/response.utility');


function isValidEmail(email) {
    return validator.isEmail(email);
}

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const requiredFields = { email, password };

    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
            return new ResponseUtil({
                success: false,
                message: `${key} is required`,
                data: null,
                statusCode: 400,
            }, res);
        }
    }

    if (!isValidEmail(email)) {
        return new ResponseUtil({
            success: false,
            message: 'Invalid email format',
            data: null,
            statusCode: 400,
        }, res);
    }

    next();
};


const validateRegister = (req, res, next) => {
    const { name, email, password, countryCode, contactNumber } = req.body;

    const requiredFields = { name, email, password, countryCode, contactNumber };

   
    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
            return new ResponseUtil({
                success: false,
                message: `${key} is required`,
                data: null,
                statusCode: 400,
            }, res);
        }
    }

    if (!isValidEmail(email)) {
        return new ResponseUtil({
            success: false,
            message: 'Invalid email format',
            data: null,
            statusCode: 400,
        }, res);
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
};
