<template>
  <div class="knowledge-review-container">
    <div class="layout-container">
      <el-card class="filter-card" shadow="hover">
        <div class="filter-bar">
          <el-input
            v-model="searchForm.name"
            placeholder="按名称搜索"
            class="filter-input"
            clearable
            @keyup.enter="handleSearch"
          />
          <el-input
            v-model="searchForm.uploader_id"
            placeholder="按上传者ID搜索"
            class="filter-input"
            clearable
            @keyup.enter="handleSearch"
          />
          <el-select
            v-model="searchForm.sort_by"
            class="filter-select"
          >
            <el-option label="创建时间" value="created_at" />
            <el-option label="更新时间" value="updated_at" />
            <el-option label="名称" value="name" />
            <el-option label="下载量" value="downloads" />
            <el-option label="收藏量" value="star_count" />
          </el-select>
          <el-select
            v-model="searchForm.sort_order"
            class="filter-select"
          >
            <el-option label="升序" value="asc" />
            <el-option label="降序" value="desc" />
          </el-select>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="resetSearch">
            重置
          </el-button>
        </div>
      </el-card>

      <el-card class="list-card" shadow="hover">
        <div class="card-header">
          <div class="card-title-group">
            <h2 class="page-title">知识库审核</h2>
            <p class="page-subtitle">
              展示待审核的知识库，仅管理员可以执行通过或拒绝操作
            </p>
          </div>
        </div>

        <div v-loading="loading">
          <div
            v-for="kb in reviewList"
            :key="kb.id"
            class="review-item"
          >
            <div class="review-main">
              <div class="review-title-row">
                <span class="review-name">{{ kb.name }}</span>
                <span class="review-status pending">
                  待审核
                </span>
              </div>
              <p v-if="kb.description" class="review-description">
                {{ kb.description }}
              </p>
              <div class="review-meta">
                <span class="review-author">
                  上传者：{{ kb.author || kb.author_id || kb.uploader_id || '未知' }}
                </span>
                <span class="review-time">
                  上传时间：{{ formatDate(kb.created_at) }}
                </span>
              </div>
            </div>
            <div class="review-actions">
              <div class="review-stats">
                <span class="review-stat">
                  <el-icon>
                    <Download />
                  </el-icon>
                  {{ kb.downloads || 0 }}
                </span>
                <span class="review-stat">
                  <el-icon>
                    <Star />
                  </el-icon>
                  {{ kb.star_count || 0 }}
                </span>
              </div>
              <div
                v-if="isAdmin"
                class="review-action-buttons"
              >
                <el-button
                  size="small"
                  type="primary"
                  plain
                  @click="handleApprove(kb)"
                >
                  通过
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  plain
                  @click="handleReject(kb)"
                >
                  拒绝
                </el-button>
              </div>
            </div>
          </div>

          <div
            v-if="!loading && reviewList.length === 0"
            class="empty-tip"
          >
            暂无待审核的知识库。
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Star } from '@element-plus/icons-vue'
import { getPendingKnowledgeReview, approveKnowledgeBaseReview, rejectKnowledgeBaseReview } from '@/api/knowledge'
import { getCurrentUser } from '@/api/user'
import { handleApiError } from '@/utils/api'

const loading = ref(false)
const reviewList = ref([])
const isAdmin = ref(false)

const searchForm = reactive({
  name: '',
  uploader_id: '',
  sort_by: 'created_at',
  sort_order: 'desc'
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const fetchCurrentUserRole = async () => {
  try {
    const response = await getCurrentUser()
    if (response && response.success && response.data) {
      isAdmin.value = response.data.role === 'admin'
    } else if (response && response.data) {
      isAdmin.value = response.data.role === 'admin'
    }
  } catch (error) {
    const message = handleApiError(error, '获取用户信息失败')
    ElMessage.error(message)
  }
}

const fetchReviewList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      page_size: pagination.pageSize
    }
    if (searchForm.name) {
      params.name = searchForm.name
    }
    if (searchForm.uploader_id) {
      params.uploader_id = searchForm.uploader_id
    }
    if (searchForm.sort_by) {
      params.sort_by = searchForm.sort_by
    }
    if (searchForm.sort_order) {
      params.sort_order = searchForm.sort_order
    }
    const response = await getPendingKnowledgeReview(params)
    if (response && response.success) {
      reviewList.value = response.data || []
      pagination.total = response.total || 0
    } else {
      ElMessage.error((response && response.message) || '获取待审核知识库失败')
    }
  } catch (error) {
    const message = handleApiError(error, '获取待审核知识库失败')
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchReviewList()
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.uploader_id = ''
  searchForm.sort_by = 'created_at'
  searchForm.sort_order = 'desc'
  pagination.currentPage = 1
  fetchReviewList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchReviewList()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  fetchReviewList()
}

const handleApprove = async (kb) => {
  if (!kb || !kb.id) {
    return
  }
  try {
    const response = await approveKnowledgeBaseReview(kb.id)
    if (response && response.success) {
      ElMessage.success(response.message || '审核通过成功')
      fetchReviewList()
    } else {
      ElMessage.error((response && response.message) || '审核通过失败')
    }
  } catch (error) {
    const message = handleApiError(error, '审核通过失败')
    ElMessage.error(message)
  }
}

const handleReject = async (kb) => {
  if (!kb || !kb.id) {
    return
  }
  try {
    const { value } = await ElMessageBox.prompt(
      `请输入拒绝知识库「${kb.name}」的原因：`,
      '拒绝原因',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入拒绝原因',
        inputValidator: (val) => {
          if (!val) {
            return '请输入拒绝原因'
          }
          return true
        }
      }
    )
    const response = await rejectKnowledgeBaseReview(kb.id, value)
    if (response && response.success) {
      ElMessage.success(response.message || '审核拒绝成功')
      fetchReviewList()
    } else {
      ElMessage.error((response && response.message) || '审核拒绝失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    const message = handleApiError(error, '审核拒绝失败')
    ElMessage.error(message)
  }
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
  await fetchCurrentUserRole()
  await fetchReviewList()
})
</script>

<style scoped>
.knowledge-review-container {
  padding: 24px;
}

.layout-container {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  border-radius: 12px;
}

.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-input {
  width: 220px;
}

.filter-select {
  width: 160px;
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

.review-item {
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

.review-item:hover {
  background-color: var(--hover-color);
  border-color: var(--secondary-color);
  transform: translateY(-1px);
}

.review-main {
  flex: 1;
  min-width: 0;
}

.review-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.review-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--secondary-color);
  word-break: break-all;
}

.review-status {
  font-size: 12px;
  padding: 0 6px;
  border-radius: 999px;
}

.review-status.pending {
  background-color: rgba(246, 196, 83, 0.12);
  color: var(--secondary-color);
}

.review-description {
  margin: 0 0 6px;
  color: var(--muted-text-color);
  font-size: 13px;
}

.review-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--muted-text-color);
}

.review-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-left: 24px;
  font-size: 12px;
}

.review-stats {
  display: flex;
  gap: 12px;
}

.review-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--muted-text-color);
}

.review-action-buttons {
  display: flex;
  gap: 8px;
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
</style>

