// src/api/user.js - 用户相关API
import apiClient from './index'

// 用户登录
export const login = (username, password) => {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  
  return apiClient.post('/auth/token', params, {
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
  
  return apiClient.post('/auth/user/register', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export const checkRegisterLegality = (username, email) => {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('email', email)

  return apiClient.post('/auth/user/check_register', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 发送验证码
export const sendVerificationCode = (email) => {
  const params = new URLSearchParams()
  params.append('email', email)
  
  return apiClient.post('/auth/send_verification_code', params, {
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
  return apiClient.put('/users/me/password', {
    current_password,
    new_password,
    confirm_password
  })
}

// 删除头像
export const deleteAvatar = () => {
  return apiClient.delete('/users/me/avatar')
}

export const sendResetPasswordCode = (email) => {
  const params = new URLSearchParams()
  params.append('email', email)
  return apiClient.post('/auth/send_reset_password_code', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export const resetPassword = (email, verification_code, new_password) => {
  const params = new URLSearchParams()
  params.append('email', email)
  params.append('verification_code', verification_code)
  params.append('new_password', new_password)
  return apiClient.post('/auth/reset_password', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export const getUserStars = (params = {}) => {
  return apiClient.get('/user/stars', {
    params
  })
}
