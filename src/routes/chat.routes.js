const express = require('express');

const { handleGetChatAdmin, handleSendMessages } = require('../controller/chat.controller');
const { checkAuth } = require('../middleware/auth.middleware');
const chatRouter = express.Router();


chatRouter.route('/chat').get(checkAuth,handleGetChatAdmin);


chatRouter.route('/chat').post(checkAuth,handleSendMessages)

module.exports = { chatRouter };
