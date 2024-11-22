const socketIO = require('socket.io')
const { Server } = require('socket.io');
const Message = require('../models/message.models.js');
let io

const initSocket = (server) => {
 

    let io = new Server(server, {
        cors: {
            origin: process.env.SOCKET_IO_CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
        },
        maxHttpBufferSize: parseInt(process.env.SOCKET_IO_MAX_CONNECTIONS) || 100,
    });
    
    
    function generateRoomId(to, from) {
        return from > to ? `${from}-${to}` : `${to}-${from}`;
    }
    
    
    io.on('connection', (socket) => {
        // console.log('A user connected:', socket.id);
        socket.emit('firstMessage', "connected")
    
        socket.on('joinRoom', async (to, from) => {
            if (!to || !from) {
                return socket.emit('error', { message: 'Admin and User IDs are required to join a room.' });
            }
    
            const room = generateRoomId(to, from);
    
            try {
    
                const chatHistory = await Message.find({ room })
                    .sort({ timestamp: 1 })
                    .select('content from to timestamp');
    
                socket.join(room);
                socket.emit('chatHistory', chatHistory);
    
                // console.log(`User joined room: ${room}`);
            } catch (error) {
                console.error('Error fetching chat history:', error.message);
                socket.emit('error', { message: 'Failed to fetch chat history.' });
            }
        });
    
    
        socket.on('chatMessage', async (message, to, from) => {
            if (!message || typeof message !== 'string' || message.trim() === '') {
                return socket.emit('error', { message: 'Message must be a non-empty string.' });
            }
            if (!to || !from) {
                return socket.emit('error', { message: 'Valid Admin ID and User ID are required.' });
            }
    
            const room = generateRoomId(to, from);
            try {
                const newMessage = new Message({
                    room,
                    from,
                    to,
                    content: message,
                });
    
                await newMessage.save();
    
                const roomMembers = io.sockets.adapter.rooms.get(room);
    
                // console.log(`Room Members for room ${room}: ` , roomMembers)
                if (!roomMembers || !roomMembers.has(socket.id)) {
                    // console.error(`socket ${socket.id} is not part of room ${room}`)
                    return socket.emit('error',{message:"Not Mmeber"})
                }
                // console.log('Emitting message to room:', room, {
                //     id: newMessage._id,
                //     content: newMessage.content,
                //     from: newMessage.from,
                //     to: newMessage.to,
                //     timestamp: newMessage.timestamp,
                // });
    
                io.to(room).emit('receiveMessage', {
                    id: newMessage._id,
                    content: newMessage.content,
                    from: newMessage.from,
                    to: newMessage.to,
                    timestamp: newMessage.timestamp,
                });
    
            } catch (error) {
                // console.error('Error saving message:', error);
                if (error.name === 'ValidationError') {
                    socket.emit('error', { message: 'Invalid message data.' });
                } else {
                    socket.emit('error', { message: 'Failed to save message. Please try again later.' });
                }
            }
        });
    
    
    
        socket.on('leaveRoom', (room) => {
            if (room) {
                socket.leave(room);
                // console.log(`User left room: ${room}`);
            }
        });
    
    
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    
        socket.on('error', (err) => {
            // console.error('Socket error:', err);
            socket.emit('error', { message: 'An unexpected error occurred. Please try again later.' });
        });
    
    });
    
}

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
      }
      return io;
}

module.exports = {
    initSocket,
    getIO
}