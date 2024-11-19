const valdiator = require('validator')

function isValidEmail(email) {
return valdiator.isEmail(email)
}

const validateRegister = async (req,res,next) => {
    const { fullName, emailId, password, countryCode, contactNumber } = req.body;

    const requiredFields =  { fullName, emailId, password, countryCode, contactNumber };

    for (const [Key,Value] of Object.entries(requiredFields)){
        if (!Value) {
            return res.status(400).json({ message: `${Key} is required`})
        
        }
    }

}

module.exports = {
    validateRegister
}