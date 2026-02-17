import apiClient from './index'

export const getMessages = (page = 1, pageSize = 20, otherUserId) => {
  const params = {
    page,
    page_size: pageSize
  }
  if (otherUserId) {
    params.other_user_id = otherUserId
  }
  return apiClient.get('/messages', { params })
}

export const getMessagesByType = (messageType, page = 1, pageSize = 20) => {
  return apiClient.get(`/messages/by-type/${messageType}`, {
    params: {
      page,
      page_size: pageSize
    }
  })
}

export const markMessageRead = (messageId) => {
  return apiClient.post(`/messages/${messageId}/read`)
}

export const getMessageDetail = (messageId) => {
  return apiClient.get(`/messages/${messageId}`)
}

export const deleteMessage = (messageId) => {
  return apiClient.delete(`/messages/${messageId}`)
}

export const updateMessage = (messageId, payload) => {
  return apiClient.put(`/messages/${messageId}`, payload)
}

export const sendMessage = (payload) => {
  return apiClient.post('/messages/send', payload)
}

export const getBroadcastMessages = (params = {}) => {
  return apiClient.get('/admin/broadcast-messages', { params })
}
