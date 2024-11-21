require('dotenv').config();
const express = require('express');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./src/DB/database.DB');
const { adminRouter } = require('./src/routes/admin.routes');
const Message = require('./src/models/message.models');
const { chatRouter } = require('./src/routes/chat.routes');
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
const swaggerDocument = yaml.load('./swagger.yaml')
const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.SOCKET_IO_CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
    },
    maxHttpBufferSize: parseInt(process.env.SOCKET_IO_MAX_CONNECTIONS) || 100,
});

app.use(
    compression({
        level: 3,
    })
);

const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', adminRouter);
app.use('/api', chatRouter);

// Connect to MongoDB
connectDB()
    .then(() => {
        // Start the server
        httpServer.listen(port, () => {
            console.log(`SERVER IS RUNNING ON http://localhost:${port}`);
        });
    })
    .catch((err) => console.error(err));

function generateRoomId(adminId, userId) {
    return userId > adminId ? `${userId}-${adminId}` : `${adminId}-${userId}`;
}


io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.emit('firstMessage', "Hello How Can I Help You")

    socket.on('joinRoom', async (adminId, userId) => {
        if (!adminId || !userId) {
            return socket.emit('error', { message: 'Admin and User IDs are required to join a room.' });
        }

        const room = generateRoomId(adminId, userId);

        try {

            const chatHistory = await Message.find({ room })
                .sort({ timestamp: 1 })
                .select('content from to timestamp');

            socket.join(room);
            socket.emit('chatHistory', chatHistory);

            console.log(`User joined room: ${room}`);
        } catch (error) {
            console.error('Error fetching chat history:', error.message);
            socket.emit('error', { message: 'Failed to fetch chat history.' });
        }
    });


    socket.on('chatMessage', async (message, adminId, userId) => {
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return socket.emit('error', { message: 'Message must be a non-empty string.' });
        }
        if (!adminId || !userId || isNaN(adminId) || isNaN(userId)) {
            return socket.emit('error', { message: 'Valid Admin ID and User ID are required.' });
        }

        const room = generateRoomId(adminId, userId);
        try {
            const newMessage = new Message({
                room,
                from: userId,
                to: adminId,
                content: message,
            });

            await newMessage.save();

            
            console.log('Emitting message to room:', room, {
                id: newMessage._id,
                content: newMessage.content,
                from: newMessage.from,
                to: newMessage.to,
                timestamp: newMessage.timestamp,
            });

            io.to(room).emit('receiveMessage', {
                id: newMessage._id,
                content: newMessage.content,
                from: newMessage.from,
                to: newMessage.to,
                timestamp: newMessage.timestamp,
            });

        } catch (error) {
            console.error('Error saving message:', error);
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
            console.log(`User left room: ${room}`);
        }
    });


    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
        socket.emit('error', { message: 'An unexpected error occurred. Please try again later.' });
    });

});
