// src/api/user.js - 用户相关API
import apiClient from './index'

// 用户登录
export const login = (username, password) => {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  
  return apiClient.post('/token', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 用户注册
export const register = (username, password, email, verification_code) => {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  params.append('email', email)
  params.append('verification_code', verification_code)
  
  return apiClient.post('/user/register', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 发送验证码
export const sendVerificationCode = (email) => {
  const params = new URLSearchParams()
  params.append('email', email)
  
  return apiClient.post('/send_verification_code', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return apiClient.get('/users/me')
}

// 上传头像
export const uploadAvatar = (avatar) => {
  const formData = new FormData()
  formData.append('avatar', avatar)
  return apiClient.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 修改密码
export const changePassword = (current_password, new_password, confirm_password) => {
  const params = new URLSearchParams()
  params.append('current_password', current_password)
  params.append('new_password', new_password)
  params.append('confirm_password', confirm_password)
  
  return apiClient.put('/users/me/password', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 删除头像
export const deleteAvatar = () => {
  return apiClient.delete('/users/me/avatar')
}