const express = require('express')
const { handleRegister } = require('../controller/user.controller')
const userRouter = express.Router()

userRouter.route('/register').post(handleRegister)

module.exports = {
    userRouter
}