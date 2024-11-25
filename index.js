require('dotenv').config();
const express = require('express');
const app = express();

//Require Socket io and create server for socket io
const { createServer } = require('http');
const httpServer = createServer(app);
const {initSocket} = require('./src/handlerFunc/socket.handlerFunc')

//require DB and Another routes
const { connectDB } = require('./src/DB/database.DB');
const { adminRouter } = require('./src/routes/admin.routes');
const { chatRouter } = require('./src/routes/chat.routes');

// require and intilize the swagger and yaml
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
const swaggerDocument = yaml.load('./swagger.yaml')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

//require cors for Frontend
const cors = require('cors')
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
}));

//require compression increase speed of Api
const compression = require('compression');
app.use(
    compression({
        level: 3,
    })
);

//Get Port from ENV file 
const port = process.env.PORT || 3000;

//Use expres json urlencoded for parsing data
// app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Intilize All Routes
app.use('/api', adminRouter);
app.use('/api', chatRouter);

// Connect Db and listen Socket io and localServer
connectDB()
    .then(() => {
       initSocket(httpServer)
        httpServer.listen(port, () => {
            console.log(`SERVER IS RUNNING ON http://localhost:${port}`);
        });
    })
    .catch((err) => console.error(err));
