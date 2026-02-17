import apiClient from './index'

export const getComments = (params) => {
  return apiClient.get('/comments', {
    params
  })
}

export const createComment = (payload) => {
  return apiClient.post('/comments', payload)
}

export const deleteComment = (commentId) => {
  return apiClient.delete(`/comments/${commentId}`)
}

export const reactComment = (commentId, action) => {
  return apiClient.post(`/comments/${commentId}/react`, {
    action
  })
}

export const restoreComment = (commentId) => {
  return apiClient.post(`/comments/${commentId}/restore`)
}
