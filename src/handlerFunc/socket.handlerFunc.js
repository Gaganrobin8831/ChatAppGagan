const socketIO = require('socket.io');
const { Server } = require('socket.io');
const Message = require('../models/message.models.js');
const { validateToken } = require('../middleware/valdiate.middleware.js');
let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.SOCKET_IO_CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
        },
        maxHttpBufferSize: parseInt(process.env.SOCKET_IO_MAX_CONNECTIONS) || 100,
    });

    function generateRoomId(to, from) {
        return from > to ? `${from}-${to}` : `${to}-${from}`;
    }

    // Token validation helper function
    const validateSocketToken = (token, socket) => {
        if (token) {
            const adminPayload = validateToken(token);
            if (!adminPayload) {
                socket.emit('error', { message: 'Invalid token' });
                return null;
            }
            socket.admin = adminPayload;
            return adminPayload;
        } else {
            socket.emit('error', { message: 'Token is required' });
            return null;
        }
    };

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        // console.log(socket);

        // Get token from handshake
        const token = socket.handshake.headers.auth;
        // console.log('Received token:', token);

        // Validate token and handle connection
        const adminPayload = validateSocketToken(token, socket);
        // console.log(adminPayload);

        if (!adminPayload) return;

        // Broadcast online status if the admin is active
        if (adminPayload.status === '1') {
            socket.broadcast.emit("getOnline", { adminId: `${socket.admin.id} online` });
            console.log(socket.admin.id);

        }
        console.log("Admin Status:", socket.admin.status);

        // Join Room event

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
                socket.emit('chatHisto ry', chatHistory);

            } catch (error) {
                console.error('Error fetching chat history:', error.message);
                socket.emit('error', { message: 'Failed to fetch chat history.' });
            }
        });

        // Chat message event
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

                // Ensure the socket is part of the room
                const roomMembers = io.sockets.adapter.rooms.get(room);
                if (!roomMembers || !roomMembers.has(socket.id)) {
                    return socket.emit('error', { message: "Not a member of the room" });
                }

                // Emit the message to the room
                io.to(room).emit('receiveMessage', {
                    id: newMessage._id,
                    content: newMessage.content,
                    from: newMessage.from,
                    to: newMessage.to,
                    timestamp: newMessage.timestamp,
                });

            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('error', { message: 'Failed to save message. Please try again later.' });
            }
        });

        // Leave room event
        socket.on('leaveRoom', (room) => {
            if (room) {
                socket.leave(room);
            }
        });

        // Disconnect event
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);

            // Check admin status on disconnect

            socket.broadcast.emit("getOffline", `${socket.admin.id} offline`);

            console.log("Admin Status on Disconnect:", socket.admin.status);
            console.log(socket.admin.id);
        });

        // Generic error event
        socket.on('error', (err) => {
            socket.emit('error', { message: 'An unexpected error occurred. Please try again later.' });
        });
    });
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};

module.exports = {
    initSocket,
    getIO
};
