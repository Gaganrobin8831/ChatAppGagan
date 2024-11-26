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
    const { name, email, password, countryCode } = req.body;
    // console.log( { name, email, password, countryCode, contactNumber })
    const requiredFields = { name, email, password };
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
    // const phoneRegex = /^[0-9]{10}$/;
    // if (!contactNumber.match(phoneRegex)) {
    //     return new ResponseUtil({
    //         success: false,
    //         message: 'Invalid phone number format',
    //         data: null,
    //         statusCode: 400,
    //     }, res);
    // }

    // const fullNumber = `${countryCode}${contactNumber}`;
    
    // if (!validator.isMobilePhone(fullNumber, 'any')) {
    //     return new ResponseUtil({
    //         success: false,
    //         message: 'Invalid phone number',
    //         data: null,
    //         statusCode: 400,
    //     }, res);
    // }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
};
