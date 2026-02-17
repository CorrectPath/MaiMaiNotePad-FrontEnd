<template>
  <div class="persona-card-container">
    <div class="layout-container">
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-card shadow="hover" class="search-card">
          <div class="search-toolbar">
            <el-input
              v-model="searchForm.name"
              placeholder="搜索人设卡名称或描述"
              clearable
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <el-input
              v-model="searchForm.uploader_id"
              placeholder="作者用户名或ID"
              clearable
              class="filter-input"
              @keyup.enter="handleSearch"
            />
            <el-input
              v-model="searchForm.tag"
              placeholder="标签"
              clearable
              class="filter-input"
              @keyup.enter="handleSearch"
            />
            <el-select
              v-model="searchForm.sort_by"
              class="sort-select"
              @change="handleSearch"
            >
              <el-option label="创建时间" value="created_at" />
              <el-option label="更新时间" value="updated_at" />
              <el-option label="名称" value="name" />
              <el-option label="下载量" value="downloads" />
              <el-option label="收藏量" value="star_count" />
            </el-select>
            <el-select
              v-model="searchForm.sort_order"
              class="sort-order-select"
              @change="handleSearch"
            >
              <el-option label="降序" value="desc" />
              <el-option label="升序" value="asc" />
            </el-select>
            <el-button-group class="search-btn-group">
              <el-button
                type="primary"
                @click="handleSearch"
                class="search-btn"
              >
                搜索
              </el-button>
              <el-button @click="resetSearch">
                重置
              </el-button>
            </el-button-group>
          </div>
        </el-card>
      </div>

      <!-- 人设卡列表 -->
      <div class="persona-card-list-container">
        <div class="persona-card-list">
          <el-card
            v-for="card in personaCards"
            :key="card.id"
            shadow="hover"
            class="persona-card-item"
            @click="showCardDetail(card)"
          >
            <div class="card-header">
              <div class="card-title">
                <el-avatar
                  :size="32"
                  :src="resolveAuthorAvatar(card)"
                  class="pc-avatar"
                >
                  <template #default>
                    {{ getPCInitial(card.author || card.name) }}
                  </template>
                </el-avatar>
                <div class="card-title-main">
                  <h3 class="card-name">{{ card.name }}</h3>
                  <el-tag
                    v-if="card.version"
                    size="small"
                    type="info"
                    effect="dark"
                    class="card-version-tag"
                  >
                    v{{ card.version }}
                  </el-tag>
                </div>
              </div>
              <div class="card-stats">
                <span class="stat-item">
                  <el-icon>
                    <Download />
                  </el-icon>
                  {{ card.downloads }}
                </span>
                <span
                  class="stat-item stat-star"
                  :class="{ 'stat-star-active': card.isStarred }"
                  @click.stop="toggleStar(card)"
                >
                  <el-icon>
                    <StarFilled v-if="card.isStarred" />
                    <Star v-else />
                  </el-icon>
                  {{ card.star_count }}
                </span>
              </div>
            </div>
            <div class="card-author">
              {{ getAuthorDisplay(card) }}
            </div>
            <div class="card-description">
              {{ card.description }}
            </div>
            <div
              v-if="card.tags && card.tags.length"
              class="card-tags"
            >
              <el-tag
                v-for="(tag, index) in card.tags"
                :key="index"
                size="small"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="card-meta">
              <span class="card-date">
                {{ formatDateOnly(card.updated_at || card.created_at) }}
              </span>
              <span
                v-if="card.files && card.files.length"
                class="card-file-stat"
              >
                · {{ card.files.length }} 个文件
              </span>
              <span
                v-if="typeof card.size === 'number'"
                class="card-file-stat"
              >
                · 共 {{ formatFileSize(card.size) }}
              </span>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="dialogVisible"
      direction="rtl"
      size="75%"
      :with-header="true"
      destroy-on-close
    >
      <template #header>
        <div class="drawer-title-with-version">
          <span class="drawer-title-text">
            {{ selectedCard?.name || '人设卡详情' }}
          </span>
          <el-tag
            v-if="selectedCard && selectedCard.version"
            size="small"
            type="info"
            effect="dark"
            class="drawer-version-tag"
          >
            v{{ selectedCard.version }}
          </el-tag>
        </div>
      </template>
      <div class="dialog-content">
        <!-- 基本信息 -->
        <div class="basic-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="名称">{{ selectedCard.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="作者">{{ getAuthorName(selectedCard) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(selectedCard.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(selectedCard.updated_at) }}</el-descriptions-item>
            <el-descriptions-item label="下载量">{{ selectedCard.downloads || 0 }}</el-descriptions-item>
            <el-descriptions-item label="收藏量">{{ selectedCard.star_count || 0 }}</el-descriptions-item>
            <el-descriptions-item label="版本号">
              {{ selectedCard.version || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <span v-if="selectedCard.tags && selectedCard.tags.length > 0">
                <el-tag v-for="(tag, index) in selectedCard.tags" :key="index" size="small" style="margin-right: 5px;">{{ tag }}</el-tag>
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ selectedCard.description || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 文件列表 -->
        <div class="files-list-section">
          <h4>
            文件列表
            <span
              v-if="selectedCard && selectedCard.version"
              class="pc-version-inline"
            >
              （版本号 {{ selectedCard.version }}）
            </span>
          </h4>
          <el-table :data="selectedCard.files || []" style="width: 100%">
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
              label="修改时间"
              width="180"
              align="center"
              header-align="center"
            >
              <template #default="scope">
                {{ formatDate(scope.row.updated_at || scope.row.created_at) }}
              </template>
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
        <CommentSection
          v-if="selectedCard && selectedCard.id"
          target-type="persona"
          :target-id="selectedCard.id"
          :owner-id="selectedCard.uploader_id || selectedCard.author_id || ''"
        />
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
 </template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Star, StarFilled, Download, View } from '@element-plus/icons-vue'
import { ElMessage, ElAvatar, ElIcon } from 'element-plus'
import FileViewerDialog from '@/components/FileViewerDialog.vue'
import CommentSection from '@/components/CommentSection.vue'
import { getPublicPersonaCards, starPersonaCard, unstarPersonaCard, getPersonaCardDetail, checkPersonaCardStarred } from '@/api/persona'
import { handleApiError } from '@/utils/api'
import { usePersonaStore } from '@/stores/persona'

const apiBase = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:9278/api`

// 搜索表单
const searchForm = reactive({
  name: '',
  uploader_id: '',
  tag: '',
  sort_by: 'created_at',
  sort_order: 'desc'
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 12,
  total: 0
})

// 人设卡列表
const personaCards = ref([])

// 详情弹窗
const dialogVisible = ref(false)
const personaStore = usePersonaStore()
const { currentPersona: selectedCard } = storeToRefs(personaStore)

const fileViewerVisible = ref(false)
const fileViewerTitle = ref('')
const fileViewerFileName = ref('')
const fileViewerContent = ref('')
const fileViewerLanguage = ref('')
const fileViewerLoading = ref(false)
const fileViewerFile = ref(null)

// 获取人设卡列表
const getPersonaCards = async () => {
  try {
    const params = {
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...searchForm
    }
    
    const response = await getPublicPersonaCards(params)
    if (response.success) {
      // 处理返回的数据
      personaCards.value = response.data.map(card => ({
        ...card,
        isStarred: false // 初始化收藏状态
      }))
      pagination.total = response.total
      
      // 检查每个人设卡的收藏状态
      await checkAllStarStatus()
    } else {
      ElMessage.error(response.message || '获取人设卡列表失败')
    }
  } catch (error) {
    console.error('获取人设卡列表错误:', error)
    const errorMessage = handleApiError(error, '获取人设卡列表失败，请检查网络连接')
    ElMessage.error(errorMessage)
  }
}

// 检查所有人设卡的收藏状态
const checkAllStarStatus = async () => {
  for (const card of personaCards.value) {
    try {
      const response = await checkPersonaCardStarred(card.id)
      if (response.success) {
        card.isStarred = response.data.starred
      }
    } catch (error) {
      console.error(`检查人设卡收藏状态失败: ${card.id}`, error)
      // 忽略检查失败的情况，继续检查其他卡
    }
  }
}

// 搜索方法
const handleSearch = () => {
  pagination.currentPage = 1
  getPersonaCards()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    uploader_id: '',
    tag: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  })
  pagination.currentPage = 1
  getPersonaCards()
}

// 分页方法
const handleSizeChange = (size) => {
  pagination.pageSize = size
  getPersonaCards()
}

const handleCurrentChange = (current) => {
  pagination.currentPage = current
  getPersonaCards()
}

// 切换收藏状态
const toggleStar = async (card) => {
  try {
    let response
    if (card.isStarred) {
      // 取消Star
      response = await unstarPersonaCard(card.id)
    } else {
      // Star
      response = await starPersonaCard(card.id)
    }
    
    if (response.success) {
      card.isStarred = !card.isStarred
      // 更新收藏数
      if (card.isStarred) {
        card.star_count++
      } else {
        card.star_count--
      }
      ElMessage.success(card.isStarred ? '收藏成功' : '取消收藏成功')
    } else {
      ElMessage.error(response.message || (card.isStarred ? '取消收藏失败' : '收藏失败'))
    }
  } catch (error) {
    console.error('Star操作错误:', error)
    const errorMessage = handleApiError(error, '操作失败，请检查网络连接')
    ElMessage.error(errorMessage)
  }
}

// 显示详情弹窗
const showCardDetail = async (card) => {
  try {
    // 调用详情接口获取真实数据
    const response = await getPersonaCardDetail(card.id)
    if (response.success) {
      selectedCard.value = response.data
      dialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取人设卡详情失败')
    }
  } catch (error) {
    console.error('获取人设卡详情错误:', error)
    const errorMessage = handleApiError(error, '获取人设卡详情失败，请检查网络连接')
    ElMessage.error(errorMessage)
  }
}

// 下载单个文件
const downloadFile = async (file) => {
  try {
    if (!selectedCard.value || !selectedCard.value.id) {
      ElMessage.error('未找到要下载的人设卡')
      return
    }
    const downloadUrl = `${apiBase}/persona/${selectedCard.value.id}/file/${file.file_id}`
    
    // 使用fetch API获取文件
    const response = await fetch(downloadUrl, {
      method: 'GET',
      credentials: 'include', // 包含认证信息
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}` // 添加token
      }
    })
    
    if (!response.ok) {
      throw new Error('下载失败，HTTP状态码: ' + response.status + ', 响应文本: ' + await response.text())
    }
    
    // 将响应转换为blob对象
    const blob = await response.blob()
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.original_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 释放URL对象
    window.URL.revokeObjectURL(url)
    
    ElMessage.success(`开始下载文件: ${file.original_name}`)
  } catch (error) {
    console.error('下载单个文件错误:', error)
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
  if (!selectedCard.value || !selectedCard.value.id) {
    ElMessage.error('未找到要预览的人设卡')
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
    const previewUrl = `${apiBase}/persona/${selectedCard.value.id}/file/${file.file_id}`
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
    console.error('预览文件错误:', error)
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

const getAuthorDisplay = (item) => {
  const name = getAuthorName(item)
  return name ? `作者: ${name}` : '作者: 用户已注销'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const formatDateOnly = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleDateString()
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size || isNaN(size)) {
    return '0 B'
  }
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
}

const getPCInitial = (name) => {
  if (!name) {
    return ''
  }
  const trimmed = String(name).trim()
  if (!trimmed) {
    return ''
  }
  return trimmed[0].toUpperCase()
}

const resolveAuthorAvatar = (card) => {
  if (!card || !card.author_id) {
    return ''
  }
  const base = apiBase || ''
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base
  let url = `${trimmedBase}/users/${card.author_id}/avatar?size=64`
  if (card.avatar_updated_at) {
    url += `&t=${encodeURIComponent(card.avatar_updated_at)}`
  }
  return url
}

onMounted(() => {
  getPersonaCards()
})
</script>

<style scoped>
.persona-card-container {
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

.search-section {
  margin-bottom: 20px;
}

.search-card {
  background-color: var(--card-background);
  border-color: var(--border-color);
}

.search-btn {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.search-btn-group {
  margin-left: 4px;
}

.search-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.search-input {
  flex: 1;
  min-width: 220px;
}

.filter-input {
  width: 180px;
}

.sort-select {
  width: 140px;
}

.sort-order-select {
  width: 120px;
}

.persona-card-list-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.persona-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.persona-card-item {
  cursor: pointer;
  height: 200px;
  display: flex;
  flex-direction: column;
  background-color: var(--card-background);
  border-color: var(--border-color);
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-name {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  color: var(--secondary-color);
}

.card-author {
  color: var(--muted-text-color);
  font-size: 14px;
  margin-bottom: 10px;
}

.card-description {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  color: var(--muted-text-color);
  font-size: 14px;
  margin-bottom: 10px;
}

.card-stats {
  display: flex;
  gap: 15px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--muted-text-color);
  font-size: 14px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-version-tag {
  padding: 0 6px;
  background-color: var(--secondary-color);
  color: #303133;
  border-color: transparent;
}

.drawer-title-with-version {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drawer-title-text {
  font-size: 18px;
  font-weight: 600;
}

.drawer-version-tag {
  padding: 0 6px;
  background-color: var(--secondary-color);
  color: #303133;
  border-color: transparent;
}

.pc-avatar {
  flex-shrink: 0;
}

.card-tags {
  margin-bottom: 6px;
}

.card-tags :deep(.el-tag) {
  margin-right: 4px;
}

.card-meta {
  font-size: 12px;
  color: var(--muted-text-color);
}

.card-date {
  margin-right: 4px;
}

.card-file-stat {
  margin-left: 2px;
}

.stat-star {
  cursor: pointer;
}

.stat-star :deep(.el-icon) {
  color: var(--muted-text-color);
}

.stat-star-active :deep(.el-icon) {
  color: #f90;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 抽屉样式 */
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

.pc-version-inline {
  margin-left: 8px;
  font-size: 12px;
  color: var(--muted-text-color);
}
</style>
