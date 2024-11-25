const socketIO = require('socket.io');
const { Server } = require('socket.io');
const Message = require('../models/message.models.js');
const { validateToken } = require('../middleware/valdiate.middleware.js');
const admin = require('../models/admin.models.js');
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

    io.on('connection', async (socket) => {
        console.log('A user connected:', socket.id);

        const token = socket.handshake.headers.auth;

        const adminPayload = validateSocketToken(token, socket);


        if (!adminPayload) return;

        const adminDetail = await admin.findOne({ email: adminPayload.email });
        if (!adminDetail) return;
        adminDetail.status = true
        await adminDetail.save()

        socket.broadcast.emit("getOnline", { adminId: socket.admin.id,statuts:adminDetail.status });
        // io.emit("getOnline", { adminId: `${socket.admin.id} online`,statuts:adminDetail.status});

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
                if (!roomMembers || !roomMembers.has(socket.id)) {
                    return socket.emit('error', { message: "Not a member of the room" });
                }


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


        socket.on('leaveRoom', (room) => {
            if (room) {
                socket.leave(room);
            }
        });


        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);
            const adminDetail = await admin.findOne({ email: adminPayload.email });
            if (!adminDetail) return;
            adminDetail.status = false
            await adminDetail.save()
            socket.broadcast.emit("getOffline", { adminId: socket.admin.id, status: adminDetail.status });
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
