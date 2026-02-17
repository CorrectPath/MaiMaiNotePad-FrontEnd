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

export const formatFileSize = (size) => {
  if (!size || size <= 0) {
    return '0 B'
  }
  const kb = size / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }
  const mb = kb / 1024
  if (mb < 1024) {
    return `${mb.toFixed(1)} MB`
  }
  const gb = mb / 1024
  return `${gb.toFixed(1)} GB`
}

export const formatDate = (value) => {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}
