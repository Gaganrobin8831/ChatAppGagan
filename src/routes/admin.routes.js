const express = require('express')
const { handleRegister, handleLogin, handleAdminDetailEdit, handleLogout, handleFullDetailOfAdmin } = require('../controller/admin.controller')
const { validateRegister, validateLogin } = require('../validater/admin.validater')
const { checkAuth } = require('../middleware/auth.middleware')
const { handleGetChatAdminLatest } = require('../controller/chat.controller')

const adminRouter = express.Router()

adminRouter.route('/register')
.post(validateRegister,handleRegister)

adminRouter.route('/login')
.post(validateLogin,handleLogin)

adminRouter.route('/detailAdmin')
.get(checkAuth, handleFullDetailOfAdmin)

adminRouter.route('/getLatestChat')
.get(checkAuth,handleGetChatAdminLatest)

adminRouter.route('/logout')
.post(checkAuth,handleLogout)

adminRouter.route('/editadmindetail')
.put(checkAuth,validateRegister,handleAdminDetailEdit)

module.exports = {
    adminRouter
}