import apiClient from './index'

export const getMyUploadStats = () => {
  return apiClient.get('/me/upload-stats')
}

export const getAdminUploadStats = () => {
  return apiClient.get('/admin/upload-stats')
}

