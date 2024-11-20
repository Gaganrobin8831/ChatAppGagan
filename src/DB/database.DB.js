const mongoose = require('mongoose')

const connectDB =  async () => {
    try {
        const connectionForDB = await mongoose.connect(`${process.env.MONGO_URI}`, {
            maxPoolSize: 10, 
        })
        const response = await connectionForDB.connection.host

        console.log(`MONGO DB RUN ON !! ${response}`)
    } catch (error) {
       console.log(error) 
       process.exit(1)
    }
}

module.exports = { 
    connectDB
}