<template>
  <div class="persona-review-container">
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
            <h2 class="page-title">人设卡审核</h2>
            <p class="page-subtitle">
              展示待审核的人设卡，仅管理员或审核员可以执行通过或拒绝操作
            </p>
          </div>
        </div>

        <ReviewList
          :items="reviewList"
          :loading="loading"
          :can-review="canReview"
          empty-text="暂无待审核的人设卡。"
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Star } from '@element-plus/icons-vue'
import ReviewList from '@/components/ReviewList.vue'
import { getPendingPersonaReview, approvePersonaCardReview, rejectPersonaCardReview } from '@/api/persona'
import { getCurrentUser } from '@/api/user'
import { handleApiError } from '@/utils/api'

const loading = ref(false)
const reviewList = ref([])
const canReview = ref(false)

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
      canReview.value = ['admin', 'moderator'].includes(response.data.role)
    } else if (response && response.data) {
      canReview.value = ['admin', 'moderator'].includes(response.data.role)
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
    const response = await getPendingPersonaReview(params)
    if (response && response.success) {
      reviewList.value = response.data || []
      pagination.total = response.total || 0
    } else {
      ElMessage.error((response && response.message) || '获取待审核人设卡失败')
    }
  } catch (error) {
    const message = handleApiError(error, '获取待审核人设卡失败')
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

const handleApprove = async (pc) => {
  if (!pc || !pc.id) {
    return
  }
  try {
    const response = await approvePersonaCardReview(pc.id)
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

const handleReject = async (pc) => {
  if (!pc || !pc.id) {
    return
  }
  try {
    const { value } = await ElMessageBox.prompt(
      `请输入拒绝人设卡「${pc.name}」的原因：`,
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
    const response = await rejectPersonaCardReview(pc.id, value)
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
</script>

<style scoped>
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
</style>
