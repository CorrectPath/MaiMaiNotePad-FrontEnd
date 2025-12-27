import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import PersonaCard from '../views/PersonaCard.vue'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import UserCenter from '../views/UserCenter.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    redirect: '/persona-card',
    children: [
      {
        path: '/persona-card',
        name: 'PersonaCard',
        component: PersonaCard
      },
      {
        path: '/knowledge-base',
        name: 'KnowledgeBase',
        component: KnowledgeBase
      },
      {
        path: '/user-center',
        name: 'UserCenter',
        component: UserCenter
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
