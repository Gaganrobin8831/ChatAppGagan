const mongoose = require('mongoose')

const { Schema } = mongoose

const userSchema = new Schema({
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
    token:{
        type:String,
        default:null
    },
    profileImage:{
        type:String,
    }

},{timestamps:true})
userSchema.index({ email: 1 });
const User = mongoose.model("User",userSchema)

module.exports = User