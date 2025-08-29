import { reactive } from 'vue'
import axios from 'axios'
import { io } from 'socket.io-client'
import { toast } from 'vue3-toastify'

const API_URL = 'http://localhost:3000/api'
const SOCKET_URL = 'http://localhost:3000'

const state = reactive({
    chats: [],
    currentChat: null,
    messages: [],
    users: [],
    activeUsers: [],
    typingUsers: new Set(),
    socket: null,
    isConnected: false
})

export const chatStore = () => {
    const initializeSocket = (user) => {
        if (state.socket) {
            state.socket.disconnect()
        }

        state.socket = io(SOCKET_URL, {
            autoConnect: true
        })

        state.socket.on('connect', () => {
            state.isConnected = true
            state.socket.emit('join', user)
            console.log('Connected to server')
        })

        state.socket.on('disconnect', () => {
            state.isConnected = false
            console.log('Disconnected from server')
        })

        state.socket.on('messageReceived', (message) => {
            if (state.currentChat && message.chat === state.currentChat._id) {
                state.messages.push(message)
            }

            // Update chat list
            const chatIndex = state.chats.findIndex(chat => chat._id === message.chat)
            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = message
                state.chats[chatIndex].updatedAt = new Date()

                // Move chat to top
                const chat = state.chats.splice(chatIndex, 1)[0]
                state.chats.unshift(chat)
            }
        })

        state.socket.on('userTyping', (data) => {
            state.typingUsers.add(data.username)
        })

        state.socket.on('userStoppedTyping', (data) => {
            state.typingUsers.delete(data.username)
        })

        state.socket.on('activeUsers', (users) => {
            state.activeUsers = users
        })

        state.socket.on('userOnline', (user) => {
            state.activeUsers.push(user)
        })

        state.socket.on('userOffline', (user) => {
            state.activeUsers = state.activeUsers.filter(u => u._id !== user._id)
        })
    }

    const fetchChats = async () => {
        try {
            const response = await axios.get(`${API_URL}/chats`)
            state.chats = response.data
            return response.data
        } catch (error) {
            toast.error('Failed to fetch chats')
            throw error
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`)
            state.users = response.data
            return response.data
        } catch (error) {
            toast.error('Failed to fetch users')
            throw error
        }
    }

    const createChat = async (participantId) => {
        try {
            const response = await axios.post(`${API_URL}/chats`, {
                participantId,
                type: 'private'
            })

            const existingChatIndex = state.chats.findIndex(chat => chat._id === response.data._id)
            if (existingChatIndex === -1) {
                state.chats.unshift(response.data)
            }

            return response.data
        } catch (error) {
            toast.error('Failed to create chat')
            throw error
        }
    }

    const selectChat = async (chat) => {
        state.currentChat = chat
        state.messages = []

        // Join socket room
        if (state.socket) {
            state.socket.emit('joinRoom', chat._id)
        }

        try {
            const response = await axios.get(`${API_URL}/chats/${chat._id}/messages`)
            state.messages = response.data
        } catch (error) {
            toast.error('Failed to fetch messages')
        }
    }

    const sendMessage = async (content) => {
        if (!state.currentChat || !content.trim()) return

        try {
            const response = await axios.post(`${API_URL}/chats/${state.currentChat._id}/messages`, {
                content: content.trim(),
                type: 'text'
            })

            const message = response.data

            // Emit to socket for real-time updates
            if (state.socket) {
                state.socket.emit('newMessage', {
                    ...message,
                    chatId: state.currentChat._id
                })
            }

            return message
        } catch (error) {
            toast.error('Failed to send message')
            throw error
        }
    }

    const startTyping = () => {
        if (state.socket && state.currentChat) {
            state.socket.emit('typing', {
                chatId: state.currentChat._id,
                userId: state.currentChat._id,
                username: 'You'
            })
        }
    }

    const stopTyping = () => {
        if (state.socket && state.currentChat) {
            state.socket.emit('stopTyping', {
                chatId: state.currentChat._id,
                userId: state.currentChat._id
            })
        }
    }

    const disconnect = () => {
        if (state.socket) {
            state.socket.disconnect()
            state.socket = null
            state.isConnected = false
        }
    }

    return {
        state,
        initializeSocket,
        fetchChats,
        fetchUsers,
        createChat,
        selectChat,
        sendMessage,
        startTyping,
        stopTyping,
        disconnect,
        get chats() { return state.chats },
        get currentChat() { return state.currentChat },
        get messages() { return state.messages },
        get users() { return state.users },
        get typingUsers() { return Array.from(state.typingUsers) },
        get isConnected() { return state.isConnected }
    }
}