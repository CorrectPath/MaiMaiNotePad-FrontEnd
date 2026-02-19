import { ElNotification } from 'element-plus'

const baseNotification = (type, message, options = {}) => {
  return ElNotification({
    type,
    message,
    position: 'bottom-left',
    duration: 4000,
    showClose: true,
    ...options
  })
}

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

export const handleApiError = (error, defaultMessage = '请求失败') => {
  console.error('API Error:', error)
  const response = error && error.response
  const data = response && response.data

  let message =
    (data && data.error && data.error.message) ||
    (data && data.message) ||
    (data && data.detail) ||
    error.message ||
    defaultMessage

  const status = response && response.status
  const errorInfo = data && data.error
  const details = errorInfo && errorInfo.details
  const code = (errorInfo && errorInfo.code) || (details && details.code)
  const requestId = data && data.error && data.error.request_id

  const extra = []
  if (status) {
    extra.push(`状态码 ${status}`)
  }
  if (requestId) {
    extra.push(`请求ID ${requestId}`)
  }
  if (code) {
    extra.push(`错误码 ${code}`)
  }
  if (extra.length) {
    const debugLine = extra.join('，')
    message = `${message}\n${debugLine}`
  }

  return message
}

export const showApiErrorNotification = (error, defaultMessage = '请求失败') => {
  const message = handleApiError(error, defaultMessage)
  return baseNotification('error', message)
}

export const showErrorNotification = (message, options = {}) => {
  return baseNotification('error', message, options)
}

export const showSuccessNotification = (message, options = {}) => {
  return baseNotification('success', message, options)
}

export const showWarningNotification = (message, options = {}) => {
  return baseNotification('warning', message, options)
}

export const showInfoNotification = (message, options = {}) => {
  return baseNotification('info', message, options)
}

export const formatFileSize = (size) => {
  if (!size || Number.isNaN(size) || size <= 0) {
    return '0 B'
  }
  if (size < 1024) {
    return `${size} B`
  }
  const kb = size / 1024
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`
  }
  const mb = kb / 1024
  if (mb < 1024) {
    return `${mb.toFixed(2)} MB`
  }
  const gb = mb / 1024
  return `${gb.toFixed(2)} GB`
}

export const formatDate = (value) => {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleString()
}
