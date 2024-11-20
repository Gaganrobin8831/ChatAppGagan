const express = require('express')
const { handleRegister, handleLogin } = require('../controller/user.controller')
const { validateRegister, validateLogin } = require('../validater/user.validater')

const userRouter = express.Router()

userRouter.route('/register').post(validateRegister,handleRegister)
userRouter.route('/login').post(validateLogin,handleLogin)

module.exports = {
    userRouter
}