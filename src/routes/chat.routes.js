const express = require('express');
const Message = require('../models/message.models');
const User = require('../models/user.models');
const router = express.Router();


router.get('/chat/:admin_id', async (req, res) => {
    const { admin_id } = req.params;
    const userId = req.user.id;

    try {
        const room = userId > admin_id ? `${userId}${admin_id}` : `${admin_id}${userId}`;

        const chatHistory = await Message.find({ room })
            .sort({ timestamp: 1 }) 
            .populate('from', 'name email') 
            .populate('to', 'name email'); 

        res.status(200).json({
            success: true,
            message: 'Chat history fetched successfully',
            data: chatHistory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching chat history',
            errors: error.message || error,
        });
    }
});

// Send message to admin
router.post('/chat/:admin_id', async (req, res) => {
    const { admin_id } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    try {
        const room = userId > admin_id ? `${userId}${admin_id}` : `${admin_id}${userId}`;

        const newMessage = new Message({
            room,
            from: userId,
            to: admin_id,
            content,
        });

        await newMessage.save();

        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            errors: error.message || error,
        });
    }
});

module.exports = { chatRouter: router };
