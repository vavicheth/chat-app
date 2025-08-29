import express from 'express';
import asyncHandler from 'express-async-handler';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all chats for user
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    const chats = await Chat.find({
        participants: req.user._id
    })
        .populate('participants', 'username avatar status')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

    res.json(chats);
}));

// Create new chat
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
    const { participantId, type = 'private' } = req.body;

    // Check if private chat already exists
    if (type === 'private') {
        const existingChat = await Chat.findOne({
            type: 'private',
            participants: { $all: [req.user._id, participantId] }
        });

        if (existingChat) {
            return res.json(existingChat);
        }
    }

    const chat = await Chat.create({
        participants: type === 'private' ? [req.user._id, participantId] : [req.user._id],
        type,
        admin: req.user._id
    });

    await chat.populate('participants', 'username avatar status');
    res.status(201).json(chat);
}));

// Get messages for a chat
router.get('/:chatId/messages', authMiddleware, asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ chat: req.params.chatId })
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    res.json(messages.reverse());
}));

// Send message
router.post('/:chatId/messages', authMiddleware, asyncHandler(async (req, res) => {
    const { content, type = 'text' } = req.body;

    const message = await Message.create({
        sender: req.user._id,
        chat: req.params.chatId,
        content,
        type
    });

    await message.populate('sender', 'username avatar');

    // Update chat's last message
    await Chat.findByIdAndUpdate(req.params.chatId, {
        lastMessage: message._id,
        updatedAt: new Date()
    });

    res.status(201).json(message);
}));

export default router;
