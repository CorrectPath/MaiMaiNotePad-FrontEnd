<template>
  <div class="knowledge-review-container">
    <div class="layout-container page-layout-inner">
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
            <p class="page-subtitle">查看并处理用户提交的知识库公开申请</p>
          </div>
        </div>

        <ReviewList
          :items="reviewList"
          :loading="loading"
          :can-review="isAdmin"
          empty-text="暂无待审核的知识库。"
          @view="showKBDetail"
          @approve="handleApprove"
          @reject="handleReject"
        />

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

      <el-drawer
        v-model="detailDialogVisible"
        :title="safeSelectedKB.name || '知识库详情'"
        direction="rtl"
        size="75%"
        :with-header="true"
        destroy-on-close
      >
        <div class="dialog-content">
          <div class="basic-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="名称">{{ safeSelectedKB.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="作者">{{ getAuthorName(safeSelectedKB) }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatDate(safeSelectedKB.created_at) }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ formatDate(safeSelectedKB.updated_at) }}</el-descriptions-item>
              <el-descriptions-item label="下载量">{{ safeSelectedKB.downloads || 0 }}</el-descriptions-item>
              <el-descriptions-item label="收藏量">{{ safeSelectedKB.star_count || 0 }}</el-descriptions-item>
              <el-descriptions-item label="标签" :span="2">
                <span v-if="safeSelectedKB.tags && safeSelectedKB.tags.length > 0">
                  <el-tag
                    v-for="(tag, index) in safeSelectedKB.tags"
                    :key="index"
                    size="small"
                    style="margin-right: 5px;"
                  >
                    {{ tag }}
                  </el-tag>
                </span>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="描述" :span="2">{{ safeSelectedKB.description || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="download-all-section">
            <el-button type="primary" @click="downloadAllFiles">
              <el-icon>
                <Download />
              </el-icon>
              下载全部文件
            </el-button>
          </div>

          <div class="files-list-section">
            <h4>文件列表</h4>
            <el-table :data="safeSelectedKB.files || []" style="width: 100%">
              <el-table-column label="文件名" width="auto">
                <template #default="scope">{{ scope.row.original_name || '-' }}</template>
              </el-table-column>
              <el-table-column
                label="大小"
                width="120"
                align="center"
                header-align="center"
              >
                <template #default="scope">{{ formatFileSize(scope.row.file_size) }}</template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="140"
                fixed="right"
                align="center"
                header-align="center"
              >
                <template #default="scope">
                  <el-tooltip content="浏览文件" placement="top">
                    <el-button
                      type="primary"
                      text
                      circle
                      size="small"
                      @click="previewFile(scope.row)"
                    >
                      <el-icon>
                        <View />
                      </el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="下载文件" placement="top">
                    <el-button
                      type="primary"
                      text
                      circle
                      size="small"
                      @click="downloadFile(scope.row)"
                    >
                      <el-icon>
                        <Download />
                      </el-icon>
                    </el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-drawer>
      <FileViewerDialog
        v-model:visible="fileViewerVisible"
        :title="fileViewerTitle"
        :file-name="fileViewerFileName"
        :content="fileViewerContent"
        :language="fileViewerLanguage"
        :loading="fileViewerLoading"
        @download="downloadFromViewer"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox, ElAvatar, ElIcon } from 'element-plus'
import { Download, View } from '@element-plus/icons-vue'
import ReviewList from '@/components/ReviewList.vue'
import FileViewerDialog from '@/components/FileViewerDialog.vue'
import { getPendingKnowledgeReview, approveKnowledgeBaseReview, rejectKnowledgeBaseReview, getKnowledgeBaseDetail } from '@/api/knowledge'
import { handleApiError } from '@/utils/api'
import { useUserStore } from '@/stores/user'
import { useKnowledgeStore } from '@/stores/knowledge'

const apiBase = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:9278/api`

const loading = ref(false)
const reviewList = ref([])
const isAdmin = ref(false)
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const knowledgeStore = useKnowledgeStore()
const { currentKB: selectedKB } = storeToRefs(knowledgeStore)
const safeSelectedKB = computed(() => selectedKB.value || {})

const detailDialogVisible = ref(false)

const fileViewerVisible = ref(false)
const fileViewerTitle = ref('')
const fileViewerFileName = ref('')
const fileViewerContent = ref('')
const fileViewerLanguage = ref('')
const fileViewerLoading = ref(false)
const fileViewerFile = ref(null)

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
    if (!user.value || !user.value.role) {
      await userStore.fetchCurrentUser()
    }
    const role = user.value && user.value.role
    isAdmin.value = role === 'admin'
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

const showKBDetail = async (kb) => {
  if (!kb || !kb.id) {
    return
  }
  try {
    const response = await getKnowledgeBaseDetail(kb.id)
    if (response && response.success) {
      selectedKB.value = response.data || {}
      detailDialogVisible.value = true
    } else {
      ElMessage.error((response && response.message) || '获取知识库详情失败')
    }
  } catch (error) {
    const message = handleApiError(error, '获取知识库详情失败')
    ElMessage.error(message)
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

onMounted(async () => {
  await fetchCurrentUserRole()
  await fetchReviewList()
})

const getAuthorName = (item) => {
  if (!item) {
    return '用户已注销'
  }
  if (item.author) {
    return item.author
  }
  if (item.uploader_name) {
    return item.uploader_name
  }
  if (item.author_id) {
    return item.author_id
  }
  if (item.uploader_id) {
    return item.uploader_id
  }
  return '用户已注销'
}

const formatDate = (value) => {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  return date.toLocaleString()
}

const formatFileSize = (size) => {
  if (!size || isNaN(size)) {
    return '0 B'
  }
  if (size < 1024) {
    return `${size} B`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

const downloadFile = async (file) => {
  if (!selectedKB.value || !selectedKB.value.id) {
    ElMessage.error('未找到要下载的知识库')
    return
  }
  try {
    const downloadUrl = `${apiBase}/knowledge/${selectedKB.value.id}/file/${file.file_id}`
    const response = await fetch(downloadUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`下载失败，HTTP状态码: ${response.status}, 错误信息: ${errorText}`)
    }
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.original_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success(`开始下载文件: ${file.original_name}`)
  } catch (error) {
    ElMessage.error('下载失败: ' + error.message)
  }
}

const resolveFileLanguage = (fileName) => {
  const lower = (fileName || '').toLowerCase()
  if (lower.endsWith('.toml')) {
    return 'toml'
  }
  if (lower.endsWith('.json')) {
    return 'json'
  }
  return 'txt'
}

const isPreviewableFile = (file) => {
  const name = (file && file.original_name) || ''
  const lower = name.toLowerCase()
  return lower.endsWith('.toml') || lower.endsWith('.json') || lower.endsWith('.txt')
}

const previewFile = async (file) => {
  if (!selectedKB.value || !selectedKB.value.id) {
    ElMessage.error('未找到要预览的知识库')
    return
  }
  if (!isPreviewableFile(file)) {
    ElMessage.warning('当前文件类型暂不支持在线预览，请使用下载功能查看')
    return
  }
  const name = file.original_name || ''
  fileViewerTitle.value = name || '文件预览'
  fileViewerFileName.value = name
  fileViewerLanguage.value = resolveFileLanguage(name)
  fileViewerContent.value = ''
  fileViewerVisible.value = true
  fileViewerLoading.value = true
  fileViewerFile.value = file
  try {
    const previewUrl = `${apiBase}/knowledge/${selectedKB.value.id}/file/${file.file_id}`
    const response = await fetch(previewUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`预览失败，HTTP状态码: ${response.status}, 错误信息: ${errorText}`)
    }
    const text = await response.text()
    fileViewerContent.value = text
  } catch (error) {
    ElMessage.error('预览失败: ' + error.message)
    fileViewerVisible.value = false
  } finally {
    fileViewerLoading.value = false
  }
}

const downloadFromViewer = async () => {
  if (!fileViewerFile.value) {
    return
  }
  await downloadFile(fileViewerFile.value)
}
</script>

<style scoped>
.knowledge-review-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layout-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
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

.pagination-section {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-drawer) {
  background-color: var(--card-background);
  border-left: 1px solid var(--border-color);
}

:deep(.el-drawer__header) {
  border-bottom: 1px solid var(--border-color);
  padding: 20px;
}

:deep(.el-drawer__body) {
  overflow-y: auto;
  padding: 20px;
}

:deep(.el-drawer__headerbtn) {
  top: 20px;
  right: 20px;
}

.dialog-content {
  padding: 0;
}

.basic-info {
  margin-bottom: 20px;
}

.download-all-section {
  margin: 20px 0;
  text-align: center;
}

.files-list-section {
  margin-top: 20px;
}

.files-list-section h4 {
  margin-bottom: 10px;
  color: var(--secondary-color);
}
</style>
