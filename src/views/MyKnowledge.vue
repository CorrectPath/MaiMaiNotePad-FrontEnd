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
            @click="openDetail(kb)"
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
                  content="编辑内容和文件"
                  placement="top"
                >
                  <el-button
                    circle
                    text
                    @click.stop="openEdit(kb)"
                  >
                    <el-icon>
                      <Edit />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip
                  v-if="!kb.is_public && !kb.is_pending"
                  content="申请公开到知识库广场（需审核）"
                  placement="top"
                >
                  <el-button
                    circle
                    text
                    @click.stop="requestPublish(kb)"
                  >
                    <el-icon>
                      <UploadFilled />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button circle text type="danger" @click.stop="confirmDelete(kb)">
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

    <el-dialog
      v-model="editDialogVisible"
      :title="editingKB ? `编辑知识库 - ${editingKB.name}` : '编辑知识库'"
      width="720px"
      destroy-on-close
    >
      <el-form label-width="100px" class="edit-form">
        <el-form-item label="知识库简介">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="标签">
          <div class="tags-editor">
            <el-tag
              v-for="tag in editForm.tags"
              :key="tag"
              closable
              size="small"
              @close="removeEditTag(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-model="editTagInput"
              class="tag-input"
              size="small"
              placeholder="输入标签，按逗号分隔"
              @keydown.enter.stop.prevent
              @keyup="handleEditTagInputKeyup"
              @blur="commitEditTagInput"
            />
          </div>
        </el-form-item>
      </el-form>

      <div class="files-header">
        <div class="kb-name">文件列表</div>
        <div class="files-actions">
          <input
            ref="fileInput"
            type="file"
            multiple
            style="display: none"
            @change="handleFileChange"
          />
          <el-button type="primary" link @click="triggerFileSelect">
            <el-icon>
              <UploadFilled />
            </el-icon>
            添加文件
          </el-button>
        </div>
      </div>

      <el-table
        v-if="fileList.length"
        :data="fileList"
        size="small"
        border
      >
        <el-table-column
          prop="original_name"
          label="文件名"
          min-width="260"
        />
        <el-table-column
          prop="file_size"
          label="大小"
          width="120"
        >
          <template #default="scope">
            {{ formatFileSize(scope.row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="160"
        >
          <template #default="scope">
            <el-button
              type="primary"
              text
              size="small"
              @click="downloadKBFile(scope.row)"
            >
              下载
            </el-button>
            <el-button
              type="danger"
              text
              size="small"
              @click="confirmDeleteFile(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div
        v-else
        class="empty-tip"
      >
        暂无文件，可以通过上方按钮添加文件。
      </div>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBasicInfo">保存信息</el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="detailDrawerVisible"
      :title="currentKB ? currentKB.name : '知识库详情'"
      direction="rtl"
      size="75%"
      :with-header="true"
      destroy-on-close
    >
      <div v-if="currentKB" class="dialog-content">
        <div class="basic-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="名称">
              {{ currentKB.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <span v-if="currentKB.is_public && !currentKB.is_pending">公开</span>
              <span v-else-if="!currentKB.is_public && currentKB.is_pending">公开审核中</span>
              <span v-else>私有</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(currentKB.created_at) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDate(currentKB.updated_at) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="下载量">
              {{ currentKB.downloads || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="收藏量">
              {{ currentKB.star_count || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <span v-if="currentKB.tags && currentKB.tags.length">
                <el-tag
                  v-for="(tag, index) in currentKB.tags"
                  :key="index"
                  size="small"
                  style="margin-right: 5px"
                >
                  {{ tag }}
                </el-tag>
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">
              {{ currentKB.description || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="drawer-remark-section">
          <div class="drawer-remark-header">
            <h4>补充说明</h4>
            <el-button
              text
              circle
              size="small"
              @click="startEditRemark"
            >
              <el-icon>
                <Edit />
              </el-icon>
            </el-button>
          </div>
          <div v-if="!editingRemark" class="drawer-remark-content">
            {{ currentKB.content || '-' }}
          </div>
          <div v-else>
            <el-input
              v-model="remarkContent"
              type="textarea"
              :rows="4"
            />
            <div class="form-tip">
              补充说明仅自己可见，不会在知识库广场等公共页面展示
            </div>
            <div class="drawer-remark-actions">
              <el-button
                type="primary"
                size="small"
                @click="saveRemark"
              >
                保存
              </el-button>
              <el-button
                size="small"
                @click="cancelRemarkEdit"
              >
                取消
              </el-button>
            </div>
          </div>
        </div>

        <div class="download-all-section">
          <el-button
            type="primary"
            :disabled="!currentKB.files || !currentKB.files.length"
            @click="downloadAllFilesInKB"
          >
            <el-icon>
              <Download />
            </el-icon>
            打包下载全部文件
          </el-button>
        </div>

        <div class="files-list-section">
          <h4>文件列表</h4>
          <el-table :data="currentKB.files || []" style="width: 100%">
            <el-table-column label="文件名" width="auto">
              <template #default="scope">
                {{ scope.row.original_name || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="大小" width="120">
              <template #default="scope">
                {{ formatFileSize(scope.row.file_size) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button type="primary" text @click="downloadDrawerFile(scope.row)">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Star, Download, Delete, UploadFilled, Edit } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getUserKnowledgeBase,
  getKnowledgeBaseDetail,
  updateKnowledgeBase,
  deleteKnowledgeBase,
  addFilesToKnowledgeBase,
  deleteFileFromKnowledgeBase
} from '@/api/knowledge'
import { getCurrentUser } from '@/api/user'
import { handleApiError } from '@/utils/api'

const router = useRouter()

const loading = ref(false)
const knowledgeList = ref([])
const userId = ref('')
const sortOption = ref('updated_desc')

const editDialogVisible = ref(false)
const editingKB = ref(null)
const editForm = reactive({
  name: '',
  description: '',
  tags: [],
  copyright_owner: ''
})
const editTagInput = ref('')
const fileList = ref([])
const fileInput = ref(null)

const detailDrawerVisible = ref(false)
const currentKB = ref(null)
const remarkContent = ref('')
const editingRemark = ref(false)

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
    await ElMessageBox.confirm(
      '申请公开后，知识库将在审核通过后公开展示。\n\n一旦审核通过：\n- 无法将知识库再改回私有；\n- 无法继续编辑知识库的基本信息和文件（补充说明仍可编辑）。\n\n确定要申请公开吗？',
      '确认申请公开',
      {
        confirmButtonText: '确认申请公开',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }
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

const openDetail = async (kb) => {
  try {
    const response = await getKnowledgeBaseDetail(kb.id)
    if (response && response.success) {
      const data = response.data || {}
      currentKB.value = data
      remarkContent.value = data.content || ''
      editingRemark.value = false
      detailDrawerVisible.value = true
    } else {
      ElMessage.error((response && response.message) || '获取知识库详情失败')
    }
  } catch (error) {
    const message = handleApiError(error, '获取知识库详情失败')
    ElMessage.error(message)
  }
}

const openEdit = async (kb) => {
  if (kb.is_public || kb.is_pending) {
    ElMessage.warning('公开或审核中的知识库不允许修改基本信息和文件（补充说明仍可编辑）')
    return
  }
  try {
    const response = await getKnowledgeBaseDetail(kb.id)
    if (response && response.success) {
      const data = response.data || {}
      editingKB.value = data
      editForm.name = data.name || ''
      editForm.description = data.description || ''
      editForm.tags = Array.isArray(data.tags) ? [...data.tags] : []
      editTagInput.value = ''
      editForm.copyright_owner = data.copyright_owner || ''
      fileList.value = data.files || []
      editDialogVisible.value = true
    } else {
      ElMessage.error((response && response.message) || '获取知识库详情失败')
    }
  } catch (error) {
    const message = handleApiError(error, '获取知识库详情失败')
    ElMessage.error(message)
  }
}

const saveBasicInfo = async () => {
  if (!editingKB.value) {
    return
  }
  try {
    const payload = {
      description: editForm.description,
      tags: Array.isArray(editForm.tags) ? editForm.tags.join(',') : ''
    }
    const response = await updateKnowledgeBase(editingKB.value.id, payload)
    if (response && response.success) {
      ElMessage.success(response.message || '修改知识库成功')
      editDialogVisible.value = false
      fetchKnowledge()
    } else {
      ElMessage.error((response && response.message) || '修改知识库失败')
    }
  } catch (error) {
    const message = handleApiError(error, '修改知识库失败')
    ElMessage.error(message)
  }
}

const saveRemark = async () => {
  if (!currentKB.value) {
    return
  }
  try {
    const payload = {
      content: remarkContent.value
    }
    const response = await updateKnowledgeBase(currentKB.value.id, payload)
    if (response && response.success) {
      ElMessage.success(response.message || '备注已保存')
      currentKB.value.content = remarkContent.value
      const target = knowledgeList.value.find((item) => item.id === currentKB.value.id)
      if (target) {
        target.content = remarkContent.value
      }
      editingRemark.value = false
    } else {
      ElMessage.error((response && response.message) || '保存备注失败')
    }
  } catch (error) {
    const message = handleApiError(error, '保存备注失败')
    ElMessage.error(message)
  }
}

const startEditRemark = () => {
  if (!currentKB.value) {
    return
  }
  remarkContent.value = currentKB.value.content || ''
  editingRemark.value = true
}

const cancelRemarkEdit = () => {
  if (!currentKB.value) {
    return
  }
  remarkContent.value = currentKB.value.content || ''
  editingRemark.value = false
}

const downloadDrawerFile = async (file) => {
  if (!currentKB.value) {
    return
  }
  try {
    const downloadUrl = `${import.meta.env.VUE_APP_API_BASE_URL}/knowledge/${currentKB.value.id}/file/${file.file_id}`
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
    console.error('下载单个文件错误:', error)
    ElMessage.error('下载失败: ' + error.message)
  }
}

const downloadAllFilesInKB = async () => {
  if (!currentKB.value) {
    return
  }
  try {
    const downloadUrl = `${import.meta.env.VUE_APP_API_BASE_URL}/knowledge/${currentKB.value.id}/download`
    const loading = ElMessage({
      message: '正在准备下载文件...',
      type: 'info',
      duration: 0,
      showClose: true
    })
    const response = await fetch(downloadUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        Accept: 'application/zip'
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
    link.download = `${currentKB.value.name}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    loading.close()
    ElMessage.success('开始下载知识库文件压缩包')
  } catch (error) {
    console.error('下载知识库文件压缩包错误:', error)
    ElMessage.error('下载失败: ' + error.message)
  }
}

const addTagsFromInput = (source, inputValue) => {
  if (!inputValue) {
    return
  }
  const normalized = inputValue.replace(/，/g, ',')
  const parts = normalized.split(',').map((item) => item.trim()).filter((item) => item)
  if (!parts.length) {
    return
  }
  parts.forEach((tag) => {
    if (!source.includes(tag)) {
      source.push(tag)
    }
  })
}

const handleEditTagInputKeyup = (event) => {
  if (event.key === ',' || event.key === '，') {
    event.preventDefault()
    addTagsFromInput(editForm.tags, editTagInput.value)
    editTagInput.value = ''
  }
}

const commitEditTagInput = () => {
  if (!editTagInput.value) {
    return
  }
  addTagsFromInput(editForm.tags, editTagInput.value)
  editTagInput.value = ''
}

const removeEditTag = (tag) => {
  const index = editForm.tags.indexOf(tag)
  if (index !== -1) {
    editForm.tags.splice(index, 1)
  }
}

const triggerFileSelect = () => {
  if (!editingKB.value) {
    return
  }
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileChange = async (event) => {
  if (!editingKB.value) {
    return
  }
  const files = event.target.files
  if (!files || !files.length) {
    return
  }
  try {
    const fileArray = Array.from(files)
    const response = await addFilesToKnowledgeBase(editingKB.value.id, fileArray)
    if (response && response.success) {
      ElMessage.success(response.message || '文件添加成功')
      const detail = await getKnowledgeBaseDetail(editingKB.value.id)
      if (detail && detail.success) {
        const data = detail.data || {}
        fileList.value = data.files || []
      }
    } else {
      ElMessage.error((response && response.message) || '添加文件失败')
    }
  } catch (error) {
    const message = handleApiError(error, '添加文件失败')
    ElMessage.error(message)
  } finally {
    if (event.target) {
      event.target.value = ''
    }
  }
}

const confirmDeleteFile = (file) => {
  if (!editingKB.value) {
    return
  }
  const isLastFile = fileList.value.length <= 1
  const message = isLastFile
    ? `确认删除文件「${file.original_name}」？删除最后一个文件将会自动删除整个知识库「${editingKB.value.name}」。`
    : `确认删除文件「${file.original_name}」？`
  ElMessageBox.confirm(
    message,
    '删除文件',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => deleteFile(file))
    .catch(() => {})
}

const deleteFile = async (file) => {
  if (!editingKB.value) {
    return
  }
  try {
    const response = await deleteFileFromKnowledgeBase(editingKB.value.id, file.file_id)
    if (response && response.success) {
      const message = response.message || '文件删除成功'
      ElMessage.success(message)
      if (message.includes('知识库已自动删除')) {
        editDialogVisible.value = false
        fetchKnowledge()
      } else {
        const detail = await getKnowledgeBaseDetail(editingKB.value.id)
        if (detail && detail.success) {
          const data = detail.data || {}
          fileList.value = data.files || []
        }
      }
    } else {
      ElMessage.error((response && response.message) || '删除文件失败')
    }
  } catch (error) {
    const message = handleApiError(error, '删除文件失败')
    ElMessage.error(message)
  }
}

const downloadKBFile = async (file) => {
  if (!editingKB.value) {
    return
  }
  try {
    const downloadUrl = `${import.meta.env.VUE_APP_API_BASE_URL}/knowledge/${editingKB.value.id}/file/${file.file_id}`
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
    console.error('下载单个文件错误:', error)
    ElMessage.error('下载失败: ' + error.message)
  }
}

const formatFileSize = (size) => {
  if (!size || size <= 0) {
    return '0 B'
  }
  const kb = size / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }
  const mb = kb / 1024
  if (mb < 1024) {
    return `${mb.toFixed(1)} MB`
  }
  const gb = mb / 1024
  return `${gb.toFixed(1)} GB`
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

.tags-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-input {
  width: 260px;
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
  cursor: pointer;
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
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
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

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted-text-color);
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

.dialog-content {
  padding: 0;
}

.basic-info {
  margin-bottom: 20px;
}

.drawer-remark-section {
  margin-top: 16px;
}

.drawer-remark-section h4 {
  margin-bottom: 8px;
  color: var(--secondary-color);
}

.drawer-remark-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.drawer-remark-content {
  min-height: 60px;
  padding: 8px 10px;
  border-radius: 6px;
  background-color: var(--hover-color);
  font-size: 13px;
  color: var(--muted-text-color);
  white-space: pre-wrap;
}

.drawer-remark-actions {
  margin-top: 8px;
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
