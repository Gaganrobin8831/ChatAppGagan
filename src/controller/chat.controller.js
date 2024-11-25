const Message = require('../models/message.models');
const admin = require('../models/admin.models');
const ResponseUtil = require('../utility/response.utility');
const mongoose = require('mongoose');

async function handleGetChatAdmin(req, res) {
    const { id } = req.user || req.body;
    const { userId } = req.body;

    try {
        const room = userId > id ? `${userId}-${id}` : `${id}-${userId}`;
        // console.log(room)

        const chatHistory = await Message.find({ room })
            .sort({ timestamp: 1 })
            .populate('from', 'name email')
            .populate('to', 'name email');
        // console.log({ chatHistory })
        if (!chatHistory.length) {
            return new ResponseUtil({
                success: false,
                message: 'User have not chat with admin provide another user ID',
                data: [],
                statusCode: 200
            }, res)
        }

        return new ResponseUtil({
            success: true,
            message: 'Chat history fetched successfully',
            data: chatHistory,
            statusCode: 200
        }, res)
    } catch (error) {
        console.log(error)
        return new ResponseUtil({
            success: false,
            message: 'Error fetching chat history',
            data: [],
            statusCode: 500,
            errors: error.message || error,
        }, res)
    }
}

async function handleSendMessages(req, res) {
    const { id } = req.user || req.body;

    const { content, userId } = req.body;

    try {
        const room = userId > id ? `${userId}-${id}` : `${id}-${userId}`;
        const newMessage = new Message({
            room,
            from: userId,
            to: id,
            content,
        });

        await newMessage.save();

        return new ResponseUtil({
            success: true,
            message: 'Message sent successfully',
            data: newMessage,
            statusCode: 200,
        }, res)
    } catch (error) {
        return new ResponseUtil({
            success: false,
            message: 'Error sending message',
            data: [],
            statusCode: 500,
            errors: error.message || error,
        }, res)
    }
}

async function handleGetChatAdminLatest(req, res) {
    const { id } = req.user || req.body;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      
        const rooms = await Message.aggregate([
            { $match: { $or: [{ from: id }, { to: id }] } },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: { $cond: [{ $eq: ["$from", id] }, "$to", "$from"] },
                    latestMessage: { $first: "$$ROOT" }
                }
            },
            {
                $project: {
                    _id: 0,
                    "latestMessage._id": 1,
                    "latestMessage.room": 1,
                    "latestMessage.from": 1,
                    "latestMessage.to": 1,
                    "latestMessage.content": 1,
                    "latestMessage.type":1,
                    "latestMessage.timestamp": {
                        $dateToString: {
                            format: "%Y-%m-%dT%H:%M:%S.%L", 
                            date: { $toDate: "$latestMessage.timestamp" }, 
                            timezone: timezone 
                        }
                    }
                }
            },
            { $sort: { "latestMessage.timestamp": -1 } }
        ]);

        if (!rooms || rooms.length === 0) {
            return new ResponseUtil({
                success: true,
                message: "No matching rooms found for the admin",
                data: [],
                statusCode: 200
            }, res);
        }

     

        return new ResponseUtil({
            success: true,
            message: 'All chat conversations fetched successfully',
            data: rooms,
            statusCode: 200
        }, res);

    } catch (error) {
        return new ResponseUtil({
            success: false,
            message: 'Error fetching chat history',
            data: [],
            statusCode: 500,
            errors: error.message || error,
        }, res);
    }
}

module.exports = {
    handleGetChatAdmin,
    handleSendMessages,
    handleGetChatAdminLatest
}