import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Vite dev server
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Store active users
const activeUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);

    // User joins
    socket.on('join', (userData) => {
        activeUsers.set(socket.id, userData);
        socket.broadcast.emit('userOnline', userData);

        // Send current active users to the new user
        const users = Array.from(activeUsers.values());
        socket.emit('activeUsers', users);
    });

    // Join chat room
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle new message
    socket.on('newMessage', (messageData) => {
        // Broadcast to all users in the room
        io.to(messageData.chatId).emit('messageReceived', messageData);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        socket.to(data.chatId).emit('userTyping', {
            userId: data.userId,
            username: data.username
        });
    });

    socket.on('stopTyping', (data) => {
        socket.to(data.chatId).emit('userStoppedTyping', {
            userId: data.userId
        });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        const userData = activeUsers.get(socket.id);
        if (userData) {
            activeUsers.delete(socket.id);
            socket.broadcast.emit('userOffline', userData);
        }
        console.log('👤 User disconnected:', socket.id);
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running! 🚀', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});