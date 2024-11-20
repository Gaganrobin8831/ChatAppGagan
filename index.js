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


app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
    
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size is too large. Max allowed size is 5MB.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected field name in the form submission.' });
      }
      return res.status(400).json({ message: err.message });
    }
    
    if (err) {
      return res.status(500).json({ message: 'An error occurred while processing your request.', error: err.message });
    }
    next();
  });
  

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`SERVER IS RUN ON http://localhost:${port}`)
    })
})
.catch((err) => console.log(err))