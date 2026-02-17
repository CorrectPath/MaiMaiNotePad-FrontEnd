// src/api/persona.js - 人设卡相关API
import apiClient from './index'

// 上传人设卡
export const uploadPersonaCard = (formData) => {
  return apiClient.post('/persona/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取公开人设卡
export const getPublicPersonaCards = (params = {}) => {
  return apiClient.get('/persona/public', { params })
}

// 获取人设卡详情
export const getPersonaCardDetail = (pc_id) => {
  return apiClient.get(`/persona/${pc_id}`)
}

// 检查人设卡Star状态
export const checkPersonaCardStarred = (pc_id) => {
  return apiClient.get(`/persona/${pc_id}/starred`)
}

// 获取用户人设卡
export const getUserPersonaCards = (user_id, params = {}) => {
  return apiClient.get(`/persona/user/${user_id}`, { params })
}

// 更新人设卡
export const updatePersonaCard = (pc_id, payload) => {
  return apiClient.put(`/persona/${pc_id}`, payload)
}

// Star人设卡
export const starPersonaCard = (pc_id) => {
  return apiClient.post(`/persona/${pc_id}/star`)
}

// 取消Star人设卡
export const unstarPersonaCard = (pc_id) => {
  return apiClient.delete(`/persona/${pc_id}/star`)
}

// 删除人设卡
export const deletePersonaCard = (pc_id) => {
  return apiClient.delete(`/persona/${pc_id}`)
}

// 向人设卡添加文件
export const addFilesToPersonaCard = (pc_id, files) => {
  const formData = new FormData()
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i])
  }
  return apiClient.post(`/persona/${pc_id}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 从人设卡删除文件
export const deleteFileFromPersonaCard = (pc_id, file_id) => {
  return apiClient.delete(`/persona/${pc_id}/${file_id}`)
}

// 获取待审核人设卡列表
export const getPendingPersonaReview = (params = {}) => {
  return apiClient.get('/review/persona/pending', { params })
}

// 审核通过人设卡
export const approvePersonaCardReview = (pc_id) => {
  return apiClient.post(`/review/persona/${pc_id}/approve`)
}

// 审核拒绝人设卡
export const rejectPersonaCardReview = (pc_id, reason) => {
  return apiClient.post(`/review/persona/${pc_id}/reject`, { reason })
}
