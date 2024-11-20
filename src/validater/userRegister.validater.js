const valdiator = require('validator');
const ResponseUtil = require('../utility/response.utility');

function isValidEmail(email) {
return valdiator.isEmail(email)
}

const validateRegister = async (req,res,next) => {
    const {name, email, password, countryCode, contactNumber } = req.body;

    const requiredFields =  { name, email, password, countryCode, contactNumber };

    for (const [Key,Value] of Object.entries(requiredFields)){
        if (!Value) {
            return  new ResponseUtil(
                {
                    success: false,
                    message: `${Key} is required`,
                    data: null,
                    statusCode:400
                },res
            )
        }   
    }

    if (!isValidEmail(email)) {
        return new ResponseUtil(
            {
                success: false,
                message: 'Invalid email',
                data: null,
                statusCode: 400  
            },res
        )
    }
next()
}

module.exports = {
    validateRegister
}