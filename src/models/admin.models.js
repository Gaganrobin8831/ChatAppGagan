const mongoose = require('mongoose')

const { Schema } = mongoose

const adminSchema = new Schema({
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
    // contactNumber: {
    //     type: String
    // },
    // countryCode: {
    //     type: String
    // },
    role: {
        type: String,
        default: 'admin'
    },
    token: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: 0
    }


}, { timestamps: true })
adminSchema.index({ email: 1 });
const admin = mongoose.model("admin", adminSchema)

module.exports = admin