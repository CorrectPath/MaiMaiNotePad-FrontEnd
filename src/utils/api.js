// src/utils/api.js - API 工具函数

// 处理API响应
export const handleApiResponse = (response, successCallback, errorCallback) => {
  if (response.success) {
    if (successCallback) {
      successCallback(response.data, response.message)
    }
  } else {
    const errorMessage = response.message || '操作失败'
    if (errorCallback) {
      errorCallback(errorMessage)
    } else {
      console.error('API Error:', errorMessage)
    }
  }
}

// 通用错误处理
export const handleApiError = (error, defaultMessage = '请求失败') => {
  console.error('API Error:', error)
  // 优先使用后端返回的错误消息
  const message = error.response?.data?.message || 
                 error.response?.data?.error?.message || 
                 error.message || 
                 defaultMessage
  return message
}