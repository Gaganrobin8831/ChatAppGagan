const bcrypt = require('bcrypt')

async function handleRegister(req,res) {
    const {name ,email,password,countryCode,contactNumber} = req.body
   try {

    const hashPassword = await bcrypt.hash(password,10)
    console.log({name,email,hashPassword,countryCode,contactNumber});
    
    
   } catch (error) {
    console.log(error);
    
        res.status(500).send({ message: error.message });
   } 
}

module.exports = {
    handleRegister
}