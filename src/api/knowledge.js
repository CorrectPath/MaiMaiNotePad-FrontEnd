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