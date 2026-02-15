// src/api/knowledge.js - 知识库相关API
import apiClient from './index'

// 获取公开知识库
export const getPublicKnowledgeBase = (params = {}) => {
  return apiClient.get('/knowledge/public', { params })
}

// 获取知识库详情
export const getKnowledgeBaseDetail = (kb_id) => {
  return apiClient.get(`/knowledge/${kb_id}`)
}

// 检查知识库Star状态
export const checkKnowledgeBaseStarred = (kb_id) => {
  return apiClient.get(`/knowledge/${kb_id}/starred`)
}

// Star知识库
export const starKnowledgeBase = (kb_id) => {
  return apiClient.post(`/knowledge/${kb_id}/star`)
}

// 取消Star知识库
export const unstarKnowledgeBase = (kb_id) => {
  return apiClient.delete(`/knowledge/${kb_id}/star`)
}

// 获取用户知识库
export const getUserKnowledgeBase = (user_id, params = {}) => {
  return apiClient.get(`/knowledge/user/${user_id}`, { params })
}

// 上传知识库
export const uploadKnowledgeBase = (formData) => {
  return apiClient.post('/knowledge/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 更新知识库信息
export const updateKnowledgeBase = (kb_id, payload) => {
  return apiClient.put(`/knowledge/${kb_id}`, payload)
}

// 删除知识库
export const deleteKnowledgeBase = (kb_id) => {
  return apiClient.delete(`/knowledge/${kb_id}`)
}

// 为知识库追加文件
export const addFilesToKnowledgeBase = (kb_id, files) => {
  const formData = new FormData()
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i])
  }
  return apiClient.post(`/knowledge/${kb_id}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 从知识库删除单个文件
export const deleteFileFromKnowledgeBase = (kb_id, file_id) => {
  return apiClient.delete(`/knowledge/${kb_id}/${file_id}`)
}

// 获取待审核知识库列表
export const getPendingKnowledgeReview = (params = {}) => {
  return apiClient.get('/review/knowledge/pending', { params })
}

// 审核通过知识库
export const approveKnowledgeBaseReview = (kb_id) => {
  return apiClient.post(`/review/knowledge/${kb_id}/approve`)
}

// 审核拒绝知识库
export const rejectKnowledgeBaseReview = (kb_id, reason) => {
  return apiClient.post(`/review/knowledge/${kb_id}/reject`, { reason })
}
