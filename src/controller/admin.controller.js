const admin = require('../models/admin.models');
const argon2 = require('argon2');
const ResponseUtil = require('../utility/response.utility');
const { createToken } = require('../middleware/valdiate.middleware');

async function handleRegister(req, res) {
    // console.log('Body:', req.body);
    // console.log('File:', req.file);

    const { name, email, password, countryCode, contactNumber } = req.body;

    try {
        const [existingadmin, hashPassword] = await Promise.all([
            admin.findOne({ email }),
            argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 2 ** 10,
                timeCost: 2,
                parallelism: 1,
            }),
        ]);

        if (existingadmin) {
            return new ResponseUtil({
                success: false,
                message: 'You Are Already Registered',
                data: null,
                statusCode: 409,
            }, res);
        }
        // console.log( { name, email, password, countryCode, contactNumber })
        const adminData = new admin({
            name,
            email,
            password: hashPassword,
            countryCode,
            contactNumber,

        });

        await adminData.save();

        const responseadminData = adminData.toObject();
        delete responseadminData.password;

        return new ResponseUtil({
            success: true,
            message: 'admin Registered Successfully',
            data: responseadminData,
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
        // console.log({email,password})
        const adminData = await admin.findOne({ email });
        // console.log(adminData)
        if (!adminData) {
            return new ResponseUtil({
                success: false,
                message: 'Invalid Email or Password',
                data: null,
                statusCode: 401,
            }, res)
        }
        // console.log(adminData.password)
        const decryptPassword = await argon2.verify(adminData.password, password)
        if (!decryptPassword) {
            return new ResponseUtil({
                success: false,
                message: 'Invalid Email or Password',
                data: null,
                statusCode: 401,
            }, res)
        }

        const token = createToken(adminData)

        const responseadminData = {
            Name: adminData.name,
            Email: adminData.email,
            Role: adminData.role,
            token
        }
        adminData.token = token;
        await adminData.save();

        return new ResponseUtil({
            success: true,
            message: 'admin Logged In Successfully',
            data: responseadminData,
            statusCode: 200,
        }, res)

    } catch (error) {
        console.log(error)
        return new ResponseUtil({
            success: false,
            message: 'Error Occurred',
            data: null,
            statusCode: 500,
            errors: error.message || error,
        }, res);
    }
}

async function handleAdminDetailEdit(req, res) {
    console.log('Authenticated admin:', req.user);

    const { name, email, password, countryCode, contactNumber } = req.body;
    console.log({ name, email, password, countryCode, contactNumber })
    try {
        const { id } = req.user; 
        const adminData = await admin.findById(id);  

        if (!adminData) {
            return new ResponseUtil({
                success: false,
                message: 'admin not found',
                data: null,
                statusCode: 404,
            }, res);
        }

        const updatedData = {
            name: name || adminData.name,
            countryCode: countryCode || adminData.countryCode,
            contactNumber: contactNumber || adminData.contactNumber,
        };

        if (email !== adminData.email) {
            return new ResponseUtil({
                success: false,
                message: 'You cannot update your email',
                data: null,
                statusCode: 400,
            }, res);
        }

        if (password) {
            updatedData.password = await argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 2 ** 10,
                timeCost: 2,
                parallelism: 1,
            });
        }

        Object.assign(adminData, updatedData);
        await adminData.save();

        const responseAdminData = adminData.toObject();
        delete responseAdminData.password;
        delete responseAdminData.token;

        return new ResponseUtil({
            success: true,
            message: 'admin details updated successfully',
            data: responseAdminData,
            statusCode: 200,
        }, res);

    } catch (error) {
        console.log(error);
        return new ResponseUtil({
            success: false,
            message: 'Error occurred while updating admin details',
            data: null,
            statusCode: 500,
            errors: error.message || error,
        }, res);
    }
}


async function handleLogout(req, res) {
    try {
        const { id } = req.user;
        const admiData = await admin.findById(id);

        if (!admiData) {
            return new ResponseUtil({
                success: false,
                message: 'User not found',
                data: null,
                statusCode: 404,
            }, res)
            
        }

        admiData.token = null;
        await admiData.save();
        return new ResponseUtil({
            success: true,
            message: "Logout successful",
            data: null,
            statusCode: 200
        }, res)
    } catch (error) {
        // console.error('Logout Error:', error);
        return new ResponseUtil({
            success: false,
            message: 'Tnternal Server Error',
            data: null,
            statusCode: 500,
            errors: error.message || error
        }, res)

    }
}

async function handleFullDetailOfAdmin(req,res){
    const {id} = req.user;
    try{
        const adminDetail = await admin.findById(id)
        if(!adminDetail){
            return new ResponseUtil({
                success: false,
                message:"Do Not Get Detail",
                data:null,
                statusCode:404,
            },res)
        }

        const AdminData = {
            name: adminDetail.name,
            email: adminDetail.email,
            PhoneNumber:`${adminDetail.countryCode} ${adminDetail.contactNumber}`,
            role:adminDetail.role
        }

        return new ResponseUtil({
            success: true,
            message: "Admin Detail",
            data: AdminData,
            statusCode: 200
        },res)


    }catch(error){
        return new ResponseUtil({
            success: false,
            message:"Internal Server error",
            data:null,
            statusCode:500,
            errors:error.message || error
        },res)
    }
}
module.exports = {
    handleRegister,
    handleLogin,
    handleAdminDetailEdit,
    handleLogout,
    handleFullDetailOfAdmin
};
