require('dotenv').config();
const express = require('express');
const compression = require('compression');
const { createServer } = require('http');

const { connectDB } = require('./src/DB/database.DB');
const { adminRouter } = require('./src/routes/admin.routes');

const { chatRouter } = require('./src/routes/chat.routes');
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
const swaggerDocument = yaml.load('./swagger.yaml')
const app = express();
const {initSocket} = require('./src/handlerFunc/socket.handlerFunc')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
const httpServer = createServer(app);

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


connectDB()
    .then(() => {
       initSocket(httpServer)
        httpServer.listen(port, () => {
            console.log(`SERVER IS RUNNING ON http://localhost:${port}`);
        });
    })
    .catch((err) => console.error(err));
