const User = require('../models/user.models');
const argon2 = require('argon2');
const ResponseUtil = require('../utility/response.utility');
const { createToken } = require('../middleware/valdiate.middleware');
const upload = require('../utility/multer.utility');
async function handleRegister(req, res) {
    const { name, email, password, countryCode, contactNumber } = req.body;

    try {

        const [existingUser, hashPassword] = await Promise.all([
            User.findOne({ email }),
            argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 2 ** 10,
                timeCost: 2,
                parallelism: 1,
            }),
        ]);


        if (existingUser) {
            return new ResponseUtil({
                success: false,
                message: 'You Are Already Registered',
                data: null,
                statusCode: 409,
            }, res);
        }


        const userData = new User({
            name,
            email,
            password: hashPassword,
            countryCode,
            contactNumber,
            profilePhoto: req.file ? `/uploads/${req.file.filename}`:null
        });
        await userData.save();


        const responseUserData = userData.toObject();
        delete responseUserData.password;

        return new ResponseUtil({
            success: true,
            message: 'User Registered Successfully',
            data: responseUserData,
            statusCode: 200,
        }, res);

    } catch (error) {
        console.error(error);
        return new ResponseUtil({
            success: false,
            message: 'Error Occurred',
            data: null,
            statusCode: 500,
            errors: error.message || error,
        }, res);
    }
}

async function handleLogin(req, res) {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return new ResponseUtil({
                success: false,
                message: 'Invalid Email or Password',
                data: null,
                statusCode: 401,
            }, res)
        }
        const decryptPassword = await argon2.verify(user.password, password)
        if (!decryptPassword) {
            return new ResponseUtil({
                success: false,
                message: 'Invalid Email or Password',
                data: null,
                statusCode: 401,
            }, res)
        }

        const token = createToken(user)
        
        const responseUserData = {
            Name: user.name,
            Email: user.email,
            Role: user.role,
            token
        }
        user.token = token;
        await user.save(); 

        return new ResponseUtil({
            success: true,
            message: 'User Logged In Successfully',
            data: responseUserData,
            statusCode: 200,
        }, res)

    } catch (error) {
        

        return new ResponseUtil({
            success: false,
            message: 'Error Occurred',
            data: null,
            statusCode: 500,
            errors: error.message || error,
        }, res);
    }
}
module.exports = {
    handleRegister,
    handleLogin
};
