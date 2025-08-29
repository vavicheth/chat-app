<!-- views/Chat.vue -->
<template>
  <div class="h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img
                :src="auth.user?.avatar"
                :alt="auth.user?.username"
                class="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <h1 class="text-white font-semibold">{{ auth.user?.username }}</h1>
              <div class="flex items-center space-x-1">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span class="text-white text-xs">Online</span>
              </div>
            </div>
          </div>
          <button
              @click="logout"
              class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              title="Logout"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Search and New Chat -->
      <div class="p-4 space-y-3">
        <div class="relative">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <!-- User search results -->
        <div v-if="searchQuery && filteredUsers.length > 0" class="bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
          <div
              v-for="user in filteredUsers"
              :key="user._id"
              @click="startChat(user)"
              class="p-3 hover:bg-gray-100 cursor-pointer flex items-center space-x-3 border-b border-gray-200 last:border-b-0"
          >
            <img :src="user.avatar" :alt="user.username" class="w-8 h-8 rounded-full" />
            <div>
              <p class="font-medium text-sm">{{ user.username }}</p>
              <p class="text-xs text-gray-500">{{ user.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="px-4 py-2">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Recent Chats
          </h3>
        </div>

        <div v-if="chat.chats.length === 0" class="px-4 py-8 text-center text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p class="text-sm">No conversations yet</p>
          <p class="text-xs">Search for users above to start chatting</p>
        </div>

        <div
            v-for="chatItem in chat.chats"
            :key="chatItem._id"
            @click="selectChat(chatItem)"
            class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50 border-r-4 border-blue-500': chat.currentChat?._id === chatItem._id }"
        >
          <div class="flex items-center space-x-3">
            <div class="relative">
              <img
                  :src="getChatAvatar(chatItem)"
                  :alt="getChatName(chatItem)"
                  class="w-12 h-12 rounded-full"
              />
              <div
                  v-if="getChatStatus(chatItem) === 'online'"
                  class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
              ></div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="font-medium text-gray-900 truncate">
                  {{ getChatName(chatItem) }}
                </p>
                <span class="text-xs text-gray-500">
                  {{ formatTime(chatItem.updatedAt) }}
                </span>
              </div>

              <p class="text-sm text-gray-500 truncate mt-1">
                {{ getLastMessageText(chatItem) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Chat Header -->
      <div v-if="chat.currentChat" class="p-4 bg-white border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <img
              :src="getChatAvatar(chat.currentChat)"
              :alt="getChatName(chat.currentChat)"
              class="w-10 h-10 rounded-full"
          />
          <div>
            <h2 class="font-semibold text-gray-900">{{ getChatName(chat.currentChat) }}</h2>
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <span>{{ getChatStatus(chat.currentChat) }}</span>
              <span v-if="chat.typingUsers.length > 0" class="text-blue-500">
                {{ chat.typingUsers.join(', ') }} {{ chat.typingUsers.length === 1 ? 'is' : 'are' }} typing...
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Welcome Screen -->
      <div v-if="!chat.currentChat" class="flex-1 flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <svg class="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Welcome to Chat App</h3>
          <p class="text-gray-500 max-w-md mx-auto">
            Select a conversation from the sidebar to start chatting, or search for users to begin a new conversation.
          </p>
        </div>
      </div>

      <!-- Messages Area -->
      <div v-if="chat.currentChat" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar" ref="messagesContainer">
        <div
            v-for="message in chat.messages"
            :key="message._id"
            class="flex"
            :class="message.sender._id === auth.user._id ? 'justify-end' : 'justify-start'"
        >
          <!-- Received Message -->
          <div v-if="message.sender._id !== auth.user._id" class="flex items-end space-x-2 max-w-xs lg:max-w-md">
            <img
                :src="message.sender.avatar"
                :alt="message.sender.username"
                class="w-8 h-8 rounded-full"
            />
            <div>
              <div class="chat-bubble chat-bubble-received">
                <p class="text-sm">{{ message.content }}</p>
              </div>
              <p class="text-xs text-gray-500 mt-1 ml-3">
                {{ message.sender.username }} • {{ formatMessageTime(message.createdAt) }}
              </p>
            </div>
          </div>

          <!-- Sent Message -->
          <div v-else class="flex items-end space-x-2 max-w-xs lg:max-w-md">
            <div>
              <div class="chat-bubble chat-bubble-sent">
                <p class="text-sm">{{ message.content }}</p>
              </div>
              <p class="text-xs text-blue-200 mt-1 mr-3 text-right">
                {{ formatMessageTime(message.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Loading messages -->
        <div v-if="loadingMessages" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>

      <!-- Message Input -->
      <div v-if="chat.currentChat" class="p-4 bg-white border-t border-gray-200">
        <form @submit.prevent="sendMessage" class="flex items-center space-x-3">
          <div class="flex-1 relative">
            <input
                v-model="newMessage"
                @input="handleTyping"
                @keydown.enter.exact.prevent="sendMessage"
                type="text"
                placeholder="Type a message..."
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :disabled="!chat.isConnected"
            />
            <button
                type="button"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
              </svg>
            </button>
          </div>

          <button
              type="submit"
              :disabled="!newMessage.trim() || !chat.isConnected || sendingMessage"
              class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-3 rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <svg v-if="sendingMessage" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </form>

        <!-- Connection status -->
        <div v-if="!chat.isConnected" class="mt-2 text-center">
          <span class="text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full">
            Disconnected - Attempting to reconnect...
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authStore } from '../stores/auth'
import { chatStore } from '../stores/chat'

export default {
  name: 'Chat',
  data() {
    return {
      searchQuery: '',
      newMessage: '',
      sendingMessage: false,
      loadingMessages: false,
      typingTimeout: null,
      auth: authStore(),
      chat: chatStore()
    }
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return []
      return this.chat.users.filter(user =>
          user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  async mounted() {
    // Initialize auth if needed
    this.auth.initializeAuth()

    // Initialize socket connection
    this.chat.initializeSocket(this.auth.user)

    // Fetch initial data
    await Promise.all([
      this.chat.fetchChats(),
      this.chat.fetchUsers()
    ])
  },
  beforeUnmount() {
    this.chat.disconnect()
  },
  methods: {
    async logout() {
      this.chat.disconnect()
      this.auth.logout()
      this.$router.push('/login')
    },

    async startChat(user) {
      try {
        const newChat = await this.chat.createChat(user._id)
        await this.selectChat(newChat)
        this.searchQuery = ''
      } catch (error) {
        console.error('Error starting chat:', error)
      }
    },

    async selectChat(chatItem) {
      await this.chat.selectChat(chatItem)
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    async sendMessage() {
      if (!this.newMessage.trim() || this.sendingMessage) return

      this.sendingMessage = true
      const message = this.newMessage
      this.newMessage = ''

      try {
        await this.chat.sendMessage(message)
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        this.newMessage = message // Restore message on error
        console.error('Error sending message:', error)
      } finally {
        this.sendingMessage = false
      }
    },

    handleTyping() {
      this.chat.startTyping()

      // Clear existing timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout)
      }

      // Set new timeout to stop typing
      this.typingTimeout = setTimeout(() => {
        this.chat.stopTyping()
      }, 2000)
    },

    getChatName(chatItem) {
      if (chatItem.type === 'group') {
        return chatItem.name || 'Group Chat'
      }

      const otherUser = chatItem.participants.find(p => p._id !== this.auth.user._id)
      return otherUser?.username || 'Unknown User'
    },

    getChatAvatar(chatItem) {
      if (chatItem.type === 'group') {
        return chatItem.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Group'
      }

      const otherUser = chatItem.participants.find(p => p._id !== this.auth.user._id)
      return otherUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown'
    },

    getChatStatus(chatItem) {
      if (chatItem.type === 'group') {
        return `${chatItem.participants.length} members`
      }

      const otherUser = chatItem.participants.find(p => p._id !== this.auth.user._id)
      return otherUser?.status || 'offline'
    },

    getLastMessageText(chatItem) {
      if (!chatItem.lastMessage) return 'No messages yet'
      return chatItem.lastMessage.content || 'Message'
    },

    formatTime(date) {
      if (!date) return ''
      const now = new Date()
      const messageDate = new Date(date)
      const diffMs = now - messageDate
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return 'now'
      if (diffMins < 60) return `${diffMins}m`
      if (diffHours < 24) return `${diffHours}h`
      if (diffDays < 7) return `${diffDays}d`

      return messageDate.toLocaleDateString()
    },

    formatMessageTime(date) {
      if (!date) return ''
      return new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
      }
    }
  }
}
</script>