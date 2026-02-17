import apiClient from './index'

export const getAdminStats = () => {
  return apiClient.get('/admin/stats')
}

export const getRecentUsers = (params = {}) => {
  return apiClient.get('/admin/recent-users', { params })
}

export const getAdminUsers = (params = {}) => {
  return apiClient.get('/admin/users', { params })
}

export const updateUserRole = (userId, role) => {
  return apiClient.put(`/admin/users/${userId}/role`, { role })
}

export const deleteUser = (userId) => {
  return apiClient.delete(`/admin/users/${userId}`)
}

export const banUser = (userId, duration) => {
  return apiClient.post(`/admin/users/${userId}/ban`, {
    duration
  })
}

export const unbanUser = (userId) => {
  return apiClient.post(`/admin/users/${userId}/unban`)
}

export const createUserByAdmin = (payload) => {
  return apiClient.post('/admin/users', payload)
}

export const getAllKnowledgeForAdmin = (params = {}) => {
  return apiClient.get('/admin/knowledge/all', { params })
}

export const getAllPersonaForAdmin = (params = {}) => {
  return apiClient.get('/admin/persona/all', { params })
}

export const getAdminUploadHistory = (params = {}) => {
  return apiClient.get('/admin/upload-history', { params })
}

export const getAdminUploadStats = () => {
  return apiClient.get('/admin/upload-stats')
}

export const adminBatchDeleteMessages = (messageIds) => {
  return apiClient.post('/admin/messages/batch-delete', {
    message_ids: messageIds
  })
}

export const deleteUploadRecord = (uploadId) => {
  return apiClient.delete(`/admin/uploads/${uploadId}`)
}

export const reprocessUpload = (uploadId) => {
  return apiClient.post(`/admin/uploads/${uploadId}/reprocess`)
}
