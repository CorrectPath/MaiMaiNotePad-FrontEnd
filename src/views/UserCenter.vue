<template>
  <div class="user-center-container">
    <div class="layout-container">
      <el-card class="user-info-card">
        <div class="card-header">
          <div class="card-title-group">
            <h2 class="page-title">个人中心</h2>
            <p class="page-subtitle">管理账号信息、安全设置与个人上传统计</p>
          </div>
        </div>
        <el-tabs v-model="activeTab" class="user-center-tabs">
          <el-tab-pane label="基本信息" name="profile">
            <div class="user-info-content">
              <div class="avatar-section">
                <el-avatar :size="80" :src="avatarUrl" class="user-avatar">
                  <template #default>
                    <span class="avatar-placeholder">
                      {{ userInfo && userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}
                    </span>
                  </template>
                </el-avatar>
                <div class="avatar-actions">
                  <el-button
                    size="small"
                    type="primary"
                    @click="triggerAvatarSelect"
                    :loading="isAvatarUploading"
                  >
                    更换头像
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    plain
                    @click="handleDeleteAvatar"
                    :disabled="!avatarUrl || isAvatarDeleting"
                    :loading="isAvatarDeleting"
                  >
                    删除头像
                  </el-button>
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden-file-input"
                    @change="handleAvatarChange"
                  />
                </div>
              </div>
              <div class="basic-info-section">
                <div class="info-row">
                  <span class="info-label">用户名</span>
                  <span class="info-value">
                    {{ userInfo && userInfo.username ? userInfo.username : '未登录用户' }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">邮箱</span>
                  <span class="info-value">
                    {{ userInfo && userInfo.email ? userInfo.email : '-' }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">用户ID</span>
                  <span class="info-value">
                    {{ userInfo && userInfo.id ? userInfo.id : '-' }}
                  </span>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="修改密码" name="password">
            <div class="security-card-inner">
              <h3 class="section-title">账号安全</h3>
              <el-form
                :model="passwordForm"
                :rules="passwordRules"
                ref="passwordFormRef"
                label-position="left"
                label-width="120px"
                class="password-form"
              >
                <el-form-item label="当前密码" prop="current_password">
                  <el-input
                    v-model="passwordForm.current_password"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="new_password">
                  <el-input
                    v-model="passwordForm.new_password"
                    type="password"
                    placeholder="请输入新密码"
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item label="确认新密码" prop="confirm_password">
                  <el-input
                    v-model="passwordForm.confirm_password"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleChangePassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
          <el-tab-pane label="上传统计" name="stats">
            <div class="stats-section">
              <h3 class="section-title">我的上传统计</h3>
              <div class="stats-content" v-if="!statsLoading && myStats">
                <div class="stats-grid">
                  <div class="stats-item">
                    <div class="stats-label">总上传次数</div>
                    <div class="stats-value">{{ myStats.totalUploads ?? myStats.total ?? 0 }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">成功</div>
                    <div class="stats-value">{{ myStats.successCount ?? myStats.success ?? 0 }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">处理中</div>
                    <div class="stats-value">{{ myStats.processingCount ?? myStats.pending ?? 0 }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">失败</div>
                    <div class="stats-value">{{ myStats.failedCount ?? myStats.failed ?? 0 }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">知识库上传数</div>
                    <div class="stats-value">{{ myStats.knowledge ?? 0 }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">人设卡上传数</div>
                    <div class="stats-value">{{ myStats.persona ?? 0 }}</div>
                  </div>
                </div>
              </div>
              <div v-else-if="statsLoading" class="stats-loading">
                正在加载统计数据...
              </div>
              <div v-else class="stats-empty">
                暂无统计数据
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { changePassword, uploadAvatar, deleteAvatar } from '@/api/user'
import { handleApiError } from '@/utils/api'
import { useUserStore } from '@/stores/user'
import { useStatsStore } from '@/stores/stats'

const passwordFormRef = ref()
const activeTab = ref('profile')
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const userInfo = user
const statsStore = useStatsStore()
const { myStats, myStatsLoading } = storeToRefs(statsStore)
const isAvatarUploading = ref(false)
const isAvatarDeleting = ref(false)
const fileInputRef = ref(null)

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordRules = {
  current_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度在 6 到 30 个字符', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请再次输入新密码'))
        } else if (value !== passwordForm.new_password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ]
}

const apiBase = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:9278/api`

const avatarUrl = computed(() => {
  if (!userInfo.value || !userInfo.value.id) {
    return ''
  }
  const base = apiBase || ''
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base
  let url = `${trimmedBase}/users/${userInfo.value.id}/avatar?size=200`
  if (userInfo.value.avatar_updated_at) {
    url += `&t=${encodeURIComponent(userInfo.value.avatar_updated_at)}`
  }
  return url
})

const fetchUserInfo = async () => {
  try {
    await userStore.fetchCurrentUser(true)
  } catch (error) {
    const errorMessage = handleApiError(error, '获取用户信息失败，请检查网络连接')
    ElMessage.error(errorMessage)
  }
}

const fetchMyStats = async () => {
  await statsStore.fetchMyStats()
}

const triggerAvatarSelect = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleAvatarChange = async (event) => {
  const files = event.target.files
  if (!files || !files.length) {
    return
  }
  const file = files[0]
  isAvatarUploading.value = true
  try {
    const response = await uploadAvatar(file)
    if (response.success) {
      ElMessage.success(response.message || '头像上传成功')
      await fetchUserInfo()
    } else {
      ElMessage.error(response.message || '头像上传失败')
    }
  } catch (error) {
    const errorMessage = handleApiError(error, '头像上传失败，请检查网络连接')
    ElMessage.error(errorMessage)
  } finally {
    isAvatarUploading.value = false
    event.target.value = ''
  }
}

const handleDeleteAvatar = () => {
  if (!avatarUrl.value) {
    return
  }
  ElMessageBox.confirm('确定要删除当前头像吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      isAvatarDeleting.value = true
      try {
        const response = await deleteAvatar()
        if (response.success) {
          ElMessage.success(response.message || '头像已删除')
          await fetchUserInfo()
        } else {
          ElMessage.error(response.message || '删除头像失败')
        }
      } catch (error) {
        const errorMessage = handleApiError(error, '删除头像失败，请检查网络连接')
        ElMessage.error(errorMessage)
      } finally {
        isAvatarDeleting.value = false
      }
    })
    .catch(() => {})
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await changePassword(
          passwordForm.current_password,
          passwordForm.new_password,
          passwordForm.confirm_password
        )
        if (response.success) {
          ElMessage.success(response.message || '密码修改成功，请重新登录')
          ElMessageBox.alert('密码已修改，请使用新密码重新登录。', '提示', {
            confirmButtonText: '确定',
            callback: () => {
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              window.location.href = '/login'
            }
          })
        } else {
          ElMessage.error(response.message || '密码修改失败')
        }
      } catch (error) {
        const errorMessage = handleApiError(error, '密码修改失败，请检查网络连接')
        ElMessage.error(errorMessage)
      }
    } else {
      return false
    }
  })
}

onMounted(() => {
  fetchUserInfo()
  fetchMyStats()
})
</script>

<style scoped>
.user-center-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  color: var(--text-color);
  display: flex;
  justify-content: center;
}

.layout-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-info-card {
  background-color: var(--card-background);
  border-color: var(--border-color);
}

.user-center-tabs {
  margin-top: 8px;
}

.security-card-inner {
  padding-top: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  margin: 0;
  font-size: 20px;
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--muted-text-color);
}
.user-info-content {
  display: flex;
  gap: 24px;
  align-items: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  border: 2px solid var(--secondary-color);
}

.avatar-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 32px;
  background-color: var(--hover-color);
  color: var(--secondary-color);
}

.avatar-actions {
  display: flex;
  gap: 8px;
}

.hidden-file-input {
  display: none;
}

.basic-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: var(--muted-text-color);
}
.info-value {
  font-size: 14px;
  color: var(--text-color);
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
}

.password-form {
  max-width: 500px;
}

@media (max-width: 768px) {
  .user-info-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar-section {
    align-items: flex-start;
  }
}
</style>
