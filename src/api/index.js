// src/api/index.js - API 服务配置
import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  // 配置后端API的基础URL，使用环境变量
  baseURL: import.meta.env.VUE_APP_API_BASE_URL || 'http://localhost:9278/api',
  timeout: 10000, // 请求超时时间
})

// 请求拦截器 - 在请求发送前添加token等信息
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token（如果存在）
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理响应和错误
apiClient.interceptors.response.use(
  (response) => {
    // 检查响应格式是否符合后端API文档的规范
    if (response.data && response.data.success !== undefined) {
      return response.data
    }
    return response
  },
  (error) => {
    // 处理错误响应
    if (error.response && error.response.status === 401) {
      // Token过期或无效，跳转到登录页
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    // 确保错误消息可以被正确传递
    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message
    }
    return Promise.reject(error)
  }
)

export default apiClient