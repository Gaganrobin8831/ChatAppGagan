const express = require('express')
const { handleRegister, handleLogin, handleUserdetail } = require('../controller/user.controller')
const { validateRegister, validateLogin } = require('../validater/user.validater')

const { checkAuth } = require('../middleware/auth.middleware')

const userRouter = express.Router()

userRouter.route('/register')
.post(validateRegister,handleRegister)

userRouter.route('/login')
.post(validateLogin,handleLogin)

userRouter.route('/editUserdetail')
.put(checkAuth,validateRegister,handleUserdetail)

module.exports = {
    userRouter
}