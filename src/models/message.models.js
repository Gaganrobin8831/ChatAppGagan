const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
    {
        room: {
            type: String, // Room ID, usually `admin_id + user_id`
            required: true,
        },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to User model
            required: true,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to User model
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);
MessageSchema.index({ room: 1 });
module.exports = mongoose.model('Message', MessageSchema);
