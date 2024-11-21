const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
    {
        room: {
            type: String, 
            required: true,
        },
        from: {       
            type: mongoose.Schema.Types.Mixed, 
            required: true,
        },
        to: {
            type: mongoose.Schema.Types.Mixed, 
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
