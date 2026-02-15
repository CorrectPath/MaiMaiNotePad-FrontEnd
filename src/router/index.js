import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import PersonaCard from '../views/PersonaCard.vue'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import UserCenter from '../views/UserCenter.vue'
import ResetPassword from '../views/ResetPassword.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      pageTitle: '登录'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      pageTitle: '注册'
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      pageTitle: '重置密码'
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      pageTitle: '麦麦笔记本'
    },
    redirect: '/persona-card',
    children: [
      {
        path: '/persona-card',
        name: 'PersonaCard',
        component: PersonaCard,
        meta: {
          pageTitle: '人设卡'
        }
      },
      {
        path: '/knowledge-base',
        name: 'KnowledgeBase',
        component: KnowledgeBase,
        meta: {
          pageTitle: '知识库'
        }
      },
      {
        path: '/user-center',
        name: 'UserCenter',
        component: UserCenter,
        meta: {
          pageTitle: '个人中心'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const baseTitle = '麦麦笔记本'

router.afterEach((to) => {
  const pageTitle = to.meta && to.meta.pageTitle ? to.meta.pageTitle : ''
  if (pageTitle) {
    document.title = `${baseTitle} - ${pageTitle}`
  } else {
    document.title = baseTitle
  }
})

export default router
