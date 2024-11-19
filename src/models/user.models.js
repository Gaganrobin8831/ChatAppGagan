const mongoose = require('mongoose')

const { Schema } = mongoose

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    contactNumber: {
        type:String
      },
    countryCode: {
        type:String
      },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },

},{timestamps:true})

const User = mongoose.model("User",UserSchema)

module.exports = {
    User
}