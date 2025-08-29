import express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: '30d'
    });
};

// Register User
router.post('/register', asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        username,
        email,
        password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    });

    res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id)
    });
}));

// Login User
router.post('/login', asyncHandler(async (req, res) => {
    const { login, password } = req.body; // 'login' can be either username or email

    // Check if login is email (contains @) or username
    const isEmail = login.includes('@');
    const query = isEmail ? { email: login } : { username: login };
    console.log(query);

    const user = await User.findOne(query);
    console.log(user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (user && isMatch) {
        await User.findByIdAndUpdate(user._id, { status: 'online', lastSeen: new Date() });

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id)
        });
    } else {
        const loginType = isEmail ? 'email' : 'username';
        res.status(401).json({ message: `Invalid ${loginType} or password` });
    }
}));

export default router;