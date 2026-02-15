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

export const markMessageRead = (messageId) => {
  return apiClient.post(`/messages/${messageId}/read`)
}

