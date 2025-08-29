import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['private', 'group'],
        default: 'private'
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    avatar: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export const Chat = mongoose.model('Chat', chatSchema);