<!-- views/Login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
      <div>
        <div class="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome Back
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to your account to continue chatting
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="login" class="block text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <input
                id="login"
                name="login"
                type="text"
                autocomplete="username"
                required
                v-model="form.login"
                class="mt-1 input-field"
                placeholder="Enter username or email"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                v-model="form.password"
                class="mt-1 input-field"
                placeholder="Enter your password"
            />
          </div>
        </div>

        <div>
          <button
              type="submit"
              :disabled="loading"
              class="group relative w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </div>

        <div class="text-center">
          <span class="text-sm text-gray-600">
            Don't have an account?
            <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Sign up here
            </router-link>
          </span>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { authStore } from '../stores/auth'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        login: 'john_doe', // Can be username or email - pre-filled for demo
        password: 'password123'
      },
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      try {
        const auth = authStore()
        await auth.login(this.form.login, this.form.password)
        this.$router.push('/chat')
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>