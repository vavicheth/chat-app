// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../stores/auth'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/chat',
        name: 'Chat',
        component: () => import('../views/Chat.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/',
        redirect: '/chat'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
    const auth = authStore()
    const isAuthenticated = auth.isAuthenticated

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else if (to.meta.requiresGuest && isAuthenticated) {
        next('/chat')
    } else {
        next()
    }
})

export default router