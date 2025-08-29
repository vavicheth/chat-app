
import express from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all users except current user
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } })
        .select('-password')
        .sort({ username: 1 });

    res.json(users);
}));

// Search users
router.get('/search', authMiddleware, asyncHandler(async (req, res) => {
    const { q } = req.query;

    const users = await User.find({
        _id: { $ne: req.user._id },
        $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
        ]
    }).select('-password').limit(10);

    res.json(users);
}));

export default router;