require('dotenv').config()
const express = require('express')
const compression = require('compression');
const { connectDB } = require('./src/DB/database.DB')
const { userRouter } = require('./src/routes/user.routes')
const app = express()

app.use(compression({
    level: 3 
}));

const port = process.env.port

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'));
app.use('/api',userRouter)
connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`SERVER IS RUN ON http://localhost:${port}`)
    })
})
.catch((err) => console.log(err))