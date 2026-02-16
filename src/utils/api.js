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
  const message = error.response?.data?.message || 
                 error.response?.data?.error?.message || 
                 error.message || 
                 defaultMessage
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
