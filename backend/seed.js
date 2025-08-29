// seed.js
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Chat } from './models/Chat.js';
import { Message } from './models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp');
        console.log('✅ Connected to MongoDB for seeding');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Chat.deleteMany({});
        await Message.deleteMany({});

        // Create sample users
        const users = await User.create([
            {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'password123',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john_doe',
                status: 'online'
            },
            {
                username: 'jane_smith',
                email: 'jane@example.com',
                password: 'password123',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane_smith',
                status: 'online'
            },
            {
                username: 'bob_wilson',
                email: 'bob@example.com',
                password: 'password123',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob_wilson',
                status: 'away'
            },
            {
                username: 'alice_brown',
                email: 'alice@example.com',
                password: 'password123',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice_brown',
                status: 'offline'
            },
            {
                username: 'mike_johnson',
                email: 'mike@example.com',
                password: 'password123',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike_johnson',
                status: 'online'
            }
        ]);

        console.log('✅ Users created');

        // Create sample chats
        const chats = await Chat.create([
            {
                name: 'General Discussion',
                type: 'group',
                participants: [users[0]._id, users[1]._id, users[2]._id, users[3]._id],
                admin: users[0]._id,
                avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=General'
            },
            {
                name: 'Development Team',
                type: 'group',
                participants: [users[0]._id, users[1]._id, users[4]._id],
                admin: users[0]._id,
                avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Dev'
            },
            {
                type: 'private',
                participants: [users[0]._id, users[1]._id]
            },
            {
                type: 'private',
                participants: [users[0]._id, users[2]._id]
            },
            {
                type: 'private',
                participants: [users[1]._id, users[3]._id]
            }
        ]);

        console.log('✅ Chats created');

        // Create sample messages
        const messages = [
            // General Discussion messages
            {
                sender: users[0]._id,
                chat: chats[0]._id,
                content: 'Welcome everyone to the general discussion! 👋',
                type: 'text'
            },
            {
                sender: users[1]._id,
                chat: chats[0]._id,
                content: 'Thanks John! Excited to be here!',
                type: 'text'
            },
            {
                sender: users[2]._id,
                chat: chats[0]._id,
                content: 'This looks great! How is everyone doing today?',
                type: 'text'
            },
            {
                sender: users[3]._id,
                chat: chats[0]._id,
                content: 'Doing well, thanks for asking! Working on some interesting projects.',
                type: 'text'
            },

            // Development Team messages
            {
                sender: users[0]._id,
                chat: chats[1]._id,
                content: 'Hey team, let\'s discuss the new chat app features',
                type: 'text'
            },
            {
                sender: users[1]._id,
                chat: chats[1]._id,
                content: 'I\'ve been working on the real-time messaging. Socket.io integration is almost done! 🚀',
                type: 'text'
            },
            {
                sender: users[4]._id,
                chat: chats[1]._id,
                content: 'Great work! I\'m handling the user authentication and it\'s looking solid.',
                type: 'text'
            },

            // Private chat messages
            {
                sender: users[0]._id,
                chat: chats[2]._id,
                content: 'Hey Jane, how\'s the Vue 3 implementation going?',
                type: 'text'
            },
            {
                sender: users[1]._id,
                chat: chats[2]._id,
                content: 'It\'s going really well! The Options API is so clean and organized.',
                type: 'text'
            },
            {
                sender: users[0]._id,
                chat: chats[3]._id,
                content: 'Bob, are you available for a quick call about the MongoDB schemas?',
                type: 'text'
            },
            {
                sender: users[2]._id,
                chat: chats[3]._id,
                content: 'Sure! Let me know when you\'re free.',
                type: 'text'
            },
            {
                sender: users[1]._id,
                chat: chats[4]._id,
                content: 'Alice, I love the Tailwind CSS styling you\'ve been adding!',
                type: 'text'
            },
            {
                sender: users[3]._id,
                chat: chats[4]._id,
                content: 'Thank you! Tailwind makes everything so much faster to style. 💨',
                type: 'text'
            }
        ];

        const createdMessages = await Message.create(messages);
        console.log('✅ Messages created');

        // Update chats with last messages
        for (let i = 0; i < chats.length; i++) {
            const chatMessages = createdMessages.filter(msg =>
                msg.chat.toString() === chats[i]._id.toString()
            );

            if (chatMessages.length > 0) {
                const lastMessage = chatMessages[chatMessages.length - 1];
                await Chat.findByIdAndUpdate(chats[i]._id, {
                    lastMessage: lastMessage._id
                });
            }
        }

        console.log('🎉 Seed data created successfully!');
        console.log('\nSample users created:');
        users.forEach(user => {
            console.log(`- ${user.username} (${user.email}) - password: password123`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    await seedData();
};

run();