<template>
  <div class="my-knowledge-container">
    <div class="layout-container">
      <el-card class="list-card" shadow="hover">
        <div class="card-header">
          <div class="card-title-group">
            <h2 class="page-title">我的知识库</h2>
            <p class="page-subtitle">管理自己上传的知识库，支持删除和公开设置</p>
          </div>
          <div class="card-actions">
            <el-button type="primary" @click="goToUpload">
              上传新的知识库
            </el-button>
          </div>
        </div>

        <div class="toolbar">
          <el-input
            v-model="searchForm.name"
            placeholder="按名称搜索我的知识库"
            clearable
            class="toolbar-input"
            @keyup.enter="handleSearch"
          />
          <el-select
            v-model="sortOption"
            class="toolbar-sort"
          >
            <el-option label="最近更新" value="updated_desc" />
            <el-option label="最早更新" value="updated_asc" />
            <el-option label="下载量最多" value="downloads_desc" />
            <el-option label="收藏数最多" value="stars_desc" />
          </el-select>
          <el-button @click="resetSearch">重置</el-button>
        </div>

        <div v-loading="loading">
          <div
            v-for="kb in sortedKnowledgeList"
            :key="kb.id"
            class="repo-item"
          >
            <div class="repo-main">
              <div class="repo-title-row">
                <span class="repo-name">{{ kb.name }}</span>
                <span
                  v-if="kb.is_public && !kb.is_pending"
                  class="repo-visibility"
                >
                  公开
                </span>
                <span
                  v-else-if="!kb.is_public && kb.is_pending"
                  class="repo-status pending"
                >
                  公开审核中
                </span>
                <span
                  v-else
                  class="repo-visibility"
                >
                  私有
                </span>
              </div>
              <p v-if="kb.description" class="repo-description">
                {{ kb.description }}
              </p>
              <div class="repo-meta">
                <span v-if="kb.tags && kb.tags.length" class="repo-tags">
                  <el-tag
                    v-for="(tag, index) in kb.tags"
                    :key="index"
                    size="small"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </span>
                <span class="repo-updated">
                  最近更新于 {{ formatDate(kb.updated_at || kb.created_at) }}
                </span>
              </div>
            </div>
            <div class="repo-actions">
              <div class="repo-stats">
                <span class="repo-stat">
                  <el-icon>
                    <Download />
                  </el-icon>
                  {{ kb.downloads || 0 }}
                </span>
                <span class="repo-stat">
                  <el-icon>
                    <Star />
                  </el-icon>
                  {{ kb.star_count || 0 }}
                </span>
              </div>
              <div class="repo-action-buttons">
                <el-tooltip
                  v-if="!kb.is_public && !kb.is_pending"
                  content="申请公开到知识库广场（需审核）"
                  placement="top"
                >
                  <el-button
                    circle
                    text
                    @click="requestPublish(kb)"
                  >
                    <el-icon>
                      <UploadFilled />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button circle text type="danger" @click="confirmDelete(kb)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </div>
          <div
            v-if="!loading && sortedKnowledgeList.length === 0"
            class="empty-tip"
          >
            暂无知识库，点击右上角「上传新的知识库」开始创建。
          </div>
        </div>

        <div class="pagination-section">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Star, Download, Delete, UploadFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserKnowledgeBase, updateKnowledgeBase, deleteKnowledgeBase } from '@/api/knowledge'
import { getCurrentUser } from '@/api/user'
import { handleApiError } from '@/utils/api'

const router = useRouter()

const loading = ref(false)
const knowledgeList = ref([])
const userId = ref('')
const sortOption = ref('updated_desc')

const searchForm = reactive({
  name: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const fetchUserInfo = async () => {
  try {
    const response = await getCurrentUser()
    if (response && response.id) {
      userId.value = response.id
    } else if (response && response.data && response.data.id) {
      userId.value = response.data.id
    }
  } catch (error) {
    const message = handleApiError(error, '获取用户信息失败')
    ElMessage.error(message)
  }
}

const fetchKnowledge = async () => {
  if (!userId.value) {
    return
  }
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      page_size: pagination.pageSize
    }
    if (searchForm.name) {
      params.name = searchForm.name
    }
    const response = await getUserKnowledgeBase(userId.value, params)
    if (response.success) {
      knowledgeList.value = response.data || response.items || []
      pagination.total = response.total || 0
    } else {
      ElMessage.error(response.message || '获取我的知识库失败')
    }
  } catch (error) {
    const message = handleApiError(error, '获取我的知识库失败')
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

const sortedKnowledgeList = computed(() => {
  const list = [...knowledgeList.value]
  switch (sortOption.value) {
    case 'updated_asc':
      return list.sort((a, b) => new Date(a.updated_at || a.created_at || 0) - new Date(b.updated_at || b.created_at || 0))
    case 'downloads_desc':
      return list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    case 'stars_desc':
      return list.sort((a, b) => (b.star_count || 0) - (a.star_count || 0))
    case 'updated_desc':
    default:
      return list.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
  }
})

const handleSearch = () => {
  pagination.currentPage = 1
  fetchKnowledge()
}

const resetSearch = () => {
  searchForm.name = ''
  pagination.currentPage = 1
  fetchKnowledge()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchKnowledge()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  fetchKnowledge()
}

const confirmDelete = (row) => {
  ElMessageBox.prompt(
    `此操作将永久删除知识库「${row.name}」，请输入知识库名称以确认：`,
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      inputPlaceholder: `请输入：${row.name}`,
      inputValidator: (value) => {
        if (!value) {
          return '请输入知识库名称'
        }
        if (value !== row.name) {
          return '输入的名称与知识库名称不一致'
        }
        return true
      }
    }
  )
    .then(() => deleteKB(row))
    .catch(() => {})
}

const deleteKB = async (row) => {
  try {
    const response = await deleteKnowledgeBase(row.id)
    if (response.success) {
      ElMessage.success(response.message || '删除成功')
      fetchKnowledge()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    const message = handleApiError(error, '删除知识库失败')
    ElMessage.error(message)
  }
}

const requestPublish = async (kb) => {
  try {
    const response = await updateKnowledgeBase(kb.id, {
      is_pending: true
    })
    if (response.success) {
      ElMessage.success(response.message || '已提交公开申请，等待审核')
      fetchKnowledge()
    } else {
      ElMessage.error(response.message || '提交公开申请失败')
    }
  } catch (error) {
    const message = handleApiError(error, '提交公开申请失败')
    ElMessage.error(message)
  }
}

const goToUpload = () => {
  router.push('/knowledge-upload')
}

const formatDate = (value) => {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

onMounted(async () => {
  await fetchUserInfo()
  await fetchKnowledge()
})
</script>

<style scoped>
.my-knowledge-container {
  padding: 24px;
}

.layout-container {
  max-width: 1120px;
  margin: 0 auto;
}

.list-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 22px;
  margin: 0;
}

.page-subtitle {
  margin: 0;
  color: var(--muted-text-color);
  font-size: 13px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-input {
  max-width: 260px;
}

.toolbar-sort {
  width: 160px;
}

.repo-item {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  margin-bottom: 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background-color: var(--card-background);
   position: relative;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}

.repo-item:hover {
  background-color: var(--hover-color);
  border-color: var(--secondary-color);
  transform: translateY(-1px);
}

.repo-main {
  flex: 1;
  min-width: 0;
}

.repo-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.repo-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--secondary-color);
  word-break: break-all;
}

.repo-visibility {
  font-size: 12px;
  padding: 0 6px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  color: var(--muted-text-color);
}

.repo-status {
  font-size: 12px;
  padding: 0 6px;
  border-radius: 999px;
}

.repo-status.pending {
  background-color: rgba(246, 196, 83, 0.12);
  color: var(--secondary-color);
}

.repo-description {
  margin: 0 0 6px;
  color: var(--muted-text-color);
  font-size: 13px;
}

.repo-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted-text-color);
}

.repo-tags :deep(.el-tag) {
  margin-right: 4px;
}

.repo-updated {
  white-space: nowrap;
}

.repo-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-left: 24px;
  font-size: 12px;
}

.repo-stats {
  display: flex;
  gap: 12px;
}

.repo-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--muted-text-color);
}

.repo-action-buttons {
  position: absolute;
  right: 16px;
  bottom: 10px;
  display: flex;
  gap: 4px;
}

.empty-tip {
  padding: 24px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.pagination-section {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kb-name {
  font-weight: 600;
}

.files-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
