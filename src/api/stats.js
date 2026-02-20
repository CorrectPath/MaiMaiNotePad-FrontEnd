import apiClient from './index'

export const getMyUploadStats = () => {
  return apiClient.get('/users/me/upload-stats')
}

export const getMyUploadHistory = (params = {}) => {
  return apiClient.get('/users/me/upload-history', { params })
}

export const getMyDashboardStats = () => {
  return apiClient.get('/users/me/dashboard-stats')
}

export const getAdminUploadStats = () => {
  return apiClient.get('/admin/upload-stats')
}

export const getMyDashboardTrends = (params = {}) => {
  return apiClient.get('/users/me/dashboard-trends', { params })
}
