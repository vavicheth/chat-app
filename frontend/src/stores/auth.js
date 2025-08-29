import { reactive } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'

const API_URL = 'http://localhost:3000/api'

const state = reactive({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token')
})

export const authStore = () => {
    const login = async (login, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                login,
                password
            })

            const { token, ...user } = response.data

            state.token = token
            state.user = user
            state.isAuthenticated = true

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

            toast.success(`Welcome back, ${user.username}!`)
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed'
            toast.error(message)
            throw error
        }
    }

    const register = async (username, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password
            })

            const { token, ...user } = response.data

            state.token = token
            state.user = user
            state.isAuthenticated = true

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

            toast.success(`Welcome, ${user.username}!`)
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed'
            toast.error(message)
            throw error
        }
    }

    const logout = () => {
        state.token = null
        state.user = null
        state.isAuthenticated = false

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        delete axios.defaults.headers.common['Authorization']

        toast.info('Logged out successfully')
    }

    const initializeAuth = () => {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')

        if (token && user) {
            state.token = token
            state.user = JSON.parse(user)
            state.isAuthenticated = true
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
    }

    return {
        state,
        login,
        register,
        logout,
        initializeAuth,
        get user() { return state.user },
        get token() { return state.token },
        get isAuthenticated() { return state.isAuthenticated }
    }
}