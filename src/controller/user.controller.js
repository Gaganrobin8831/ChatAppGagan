const bcrypt = require('bcrypt');
const ResponseUtil = require('../utility/response.utility');

async function handleRegister(req,res) {
    const {name,email,password,countryCode,contactNumber} = req.body
    console.log({name,email,password,countryCode,contactNumber});
   try {

    const hashPassword = await bcrypt.hash(password,10)
    
    
    return new ResponseUtil({
        success:true,
        message:'User Registered Successfully',
        data:{name,email,hashPassword,countryCode,contactNumber},
        statusCode:200
    },res)

   } catch (error) {
    console.log(error);
    return new ResponseUtil({
        success:false,
        message:'Error Occured',
        data:null,
        statusCode:500
    },res)

   } 
}

module.exports = {
    handleRegister
}