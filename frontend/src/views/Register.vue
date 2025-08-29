<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
      <div>
        <div class="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Join the conversation and connect with others
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                required
                v-model="form.username"
                class="mt-1 input-field"
                placeholder="Choose a username"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="form.email"
                class="mt-1 input-field"
                placeholder="Enter your email"
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
                autocomplete="new-password"
                required
                v-model="form.password"
                class="mt-1 input-field"
                placeholder="Create a password"
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
              Creating account...
            </span>
            <span v-else>Create Account</span>
          </button>
        </div>

        <div class="text-center">
          <span class="text-sm text-gray-600">
            Already have an account?
            <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Sign in here
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
  name: 'Register',
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: ''
      },
      loading: false
    }
  },
  methods: {
    async handleRegister() {
      this.loading = true
      try {
        const auth = authStore()
        await auth.register(this.form.username, this.form.email, this.form.password)
        this.$router.push('/chat')
      } catch (error) {
        console.error('Registration error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>