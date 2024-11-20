const express = require('express')
const { handleRegister } = require('../controller/user.controller')
const { validateRegister } = require('../validater/userRegister.validater')
const userRouter = express.Router()

userRouter.route('/register').post(validateRegister,handleRegister)

module.exports = {
    userRouter
}