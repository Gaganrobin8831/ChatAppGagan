const express = require('express')
const { handleRegister, handleLogin, handleUserdetail } = require('../controller/user.controller')
const { validateRegister, validateLogin } = require('../validater/user.validater')
const upload = require('../utility/multer.utility')
const { checkAuth } = require('../middleware/auth.middleware')

const userRouter = express.Router()

userRouter.route('/register')
.post(upload.single('profileImage'),validateRegister,handleRegister)

userRouter.route('/login')
.post(validateLogin,handleLogin)

userRouter.route('/editUserdetail')
.put(checkAuth,validateRegister,upload.single('profileImage'),handleUserdetail)

module.exports = {
    userRouter
}