<template>
  <div class="home-container">
    <!-- 左侧整列菜单 -->
    <aside :class="['side-menu', { collapsed: isCollapsed }]">
      <div class="side-header">
        <div class="logo-wrapper">
          <div class="logo-placeholder">Logo</div>
          <div class="product-info">
            <h1>麦麦笔记本</h1>
            <p class="slogan">产品宣传语预留</p>
          </div>
        </div>
      </div>
      <el-menu
        class="menu-wrapper"
        router
        :unique-opened="true"
        :default-active="$route.path"
      >
        <el-menu-item index="/persona-card">
          <el-icon>
            <User />
          </el-icon>
          <span class="menu-label">人设卡</span>
        </el-menu-item>
        <el-menu-item index="/knowledge-base">
          <el-icon>
            <Collection />
          </el-icon>
          <span class="menu-label">知识库</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 右侧主区域 -->
    <div class="main-layout">
      <header class="top-header">
        <div class="header-left">
          <el-button class="collapse-btn" text circle @click="toggleCollapse">
            <el-icon>
              <Fold v-if="!isCollapsed" />
              <Expand v-else />
            </el-icon>
          </el-button>
          <h2 class="page-title">
            {{ currentPageTitle }}
          </h2>
        </div>
        <div class="header-right">
          <el-popover
            placement="bottom"
            width="360"
            trigger="click"
            v-model:visible="messagePopoverVisible"
          >
            <template #reference>
              <el-badge
                :value="unreadCount"
                :max="99"
                :hidden="unreadCount === 0"
                class="message-badge"
              >
                <el-button class="message-btn" text circle>
                  <el-icon>
                    <Bell />
                  </el-icon>
                </el-button>
              </el-badge>
            </template>
            <div class="message-list-container">
              <div class="message-list-header">
                <span class="message-list-title">消息通知</span>
                <el-button class="message-refresh-btn" text circle @click.stop="refreshMessages">
                  <el-icon>
                    <RefreshRight />
                  </el-icon>
                </el-button>
              </div>
              <div class="message-list-body">
                <div v-if="messageLoading" class="message-loading">
                  加载中...
                </div>
                <div
                  v-for="msg in messages"
                  :key="msg.id"
                  class="message-item"
                  :class="{ 'is-unread': !msg.is_read }"
                  @click="handleMessageClick(msg)"
                >
                  <div class="message-title-row">
                    <span class="message-title">{{ msg.title }}</span>
                    <span v-if="!msg.is_read" class="unread-dot"></span>
                  </div>
                  <div class="message-summary">
                    {{ msg.summary || msg.content }}
                  </div>
                  <div class="message-meta">
                    {{ formatMessageTime(msg.created_at) }}
                  </div>
                </div>
                <div v-if="!messageLoading && messages.length === 0" class="message-empty">
                  暂无消息
                </div>
              </div>
            </div>
          </el-popover>

          <el-dropdown @command="handleUserCommand">
            <span class="user-dropdown-trigger">
              <el-avatar
                :size="36"
                :src="userAvatar"
                class="user-avatar"
              >
                <template #default>
                  <UserFilled />
                </template>
              </el-avatar>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="user-center">个人中心</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <div class="content-wrapper">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UserFilled, User, Collection, Fold, Expand, Bell, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCurrentUser } from '@/api/user'
import { handleApiError } from '@/utils/api'
import { getMessages, markMessageRead } from '@/api/messages'

const router = useRouter()
const route = useRoute()
const userAvatar = ref('')
const apiBase = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:9278/api`
const isCollapsed = ref(false)
const messages = ref([])
const messageLoading = ref(false)
const messagePopoverVisible = ref(false)

const unreadCount = computed(() => {
  return messages.value.filter((item) => !item.is_read).length
})

const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    return ''
  }
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl
  }
  const base = apiBase || ''
  const root = base.endsWith('/api') ? base.slice(0, -4) : base
  return `${root}${avatarUrl}`
}

const pageTitleMap = {
  '/persona-card': '人设卡',
  '/knowledge-base': '知识库',
  '/user-center': '个人中心'
}

const currentPageTitle = computed(() => {
  return pageTitleMap[route.path] || '麦麦笔记本'
})

const formatMessageTime = (value) => {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}

const fetchMessages = async () => {
  messageLoading.value = true
  try {
    const response = await getMessages(1, 20)
    if (response.success) {
      messages.value = response.data || []
    } else {
      ElMessage.error(response.message || '获取消息列表失败')
    }
  } catch (error) {
    const errorMessage = handleApiError(error, '获取消息列表失败，请检查网络连接')
    ElMessage.error(errorMessage)
  } finally {
    messageLoading.value = false
  }
}

const refreshMessages = () => {
  fetchMessages()
}

const getUserInfo = async () => {
  try {
    const response = await getCurrentUser()
    if (response.success) {
      userAvatar.value = resolveAvatarUrl(response.data && response.data.avatar_url ? response.data.avatar_url : '')
    } else {
      console.error('获取用户信息失败:', response.message)
    }
  } catch (error) {
    console.error('获取用户信息错误:', error)
    const errorMessage = handleApiError(error, '获取用户信息失败，请检查网络连接')
    console.error('获取用户信息错误:', errorMessage)
  }
}

const handleMessageClick = async (msg) => {
  if (!msg || msg.is_read) {
    return
  }
  try {
    const response = await markMessageRead(msg.id)
    if (response && response.success) {
      msg.is_read = true
    } else if (response && response.message) {
      ElMessage.error(response.message)
    }
  } catch (error) {
    const errorMessage = handleApiError(error, '标记消息已读失败，请检查网络连接')
    ElMessage.error(errorMessage)
  }
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleUserCommand = (command) => {
  if (command === 'user-center') {
    router.push('/user-center')
  }
}

onMounted(() => {
  getUserInfo()
})

watch(
  messagePopoverVisible,
  (visible) => {
    if (visible && messages.value.length === 0 && !messageLoading.value) {
      fetchMessages()
    }
  }
)
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
  background-color: var(--primary-color);
  display: flex;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  overflow: hidden;
}

.logo-placeholder {
  width: 40px;
  height: 40px;
  background-color: var(--secondary-color);
  border-radius: 5px;
  margin-right: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--primary-color);
  font-weight: bold;
}

.product-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 180px;
  transition: opacity 0.2s ease, max-width 0.2s ease, margin-left 0.2s ease;
}

.side-menu.collapsed .product-info {
  opacity: 0;
  max-width: 0;
  margin-left: 0;
}

.menu-wrapper :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  transition: justify-content 0.2s ease;
}

.menu-label {
  margin-left: 8px;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  transition: opacity 0.2s ease, max-width 0.2s ease, margin-left 0.2s ease;
}

.side-menu.collapsed .menu-label {
  opacity: 0;
  max-width: 0;
  margin-left: 0;
}

.side-menu.collapsed .menu-wrapper :deep(.el-menu-item) {
  justify-content: center;
}

.product-info h1 {
  color: var(--secondary-color);
  font-size: 20px;
  margin: 0;
}

.slogan {
  font-size: 12px;
  color: var(--muted-text-color);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  cursor: pointer;
  width: 36px;
  height: 36px;
}

.user-dropdown-trigger {
  display: inline-flex;
  align-items: center;
}

.message-badge {
  display: inline-flex;
  align-items: center;
}

.message-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.message-btn :deep(.el-icon) {
  font-size: 18px;
}

.message-list-container {
  padding: 4px 0 0;
}

.message-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 8px;
  border-bottom: 1px solid var(--border-color);
}

.message-list-title {
  font-size: 14px;
}

.message-refresh-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.message-refresh-btn :deep(.el-icon) {
  font-size: 16px;
}

.message-list-body {
  max-height: 360px;
  padding: 8px;
  overflow-y: auto;
}

.message-item {
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.message-item:last-child {
  margin-bottom: 0;
}

.message-item:hover {
  background-color: var(--hover-color);
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 1px var(--secondary-color);
}

.message-item.is-unread {
  border-left: 3px solid var(--secondary-color);
}

.message-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.message-title {
  font-size: 14px;
  font-weight: 500;
  margin-right: 6px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background-color: var(--secondary-color);
}

.message-summary {
  font-size: 12px;
  color: var(--muted-text-color);
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-meta {
  font-size: 11px;
  color: var(--muted-text-color);
  text-align: right;
}

.message-loading,
.message-empty {
  padding: 12px 0;
  text-align: center;
  font-size: 12px;
  color: var(--muted-text-color);
}

.side-menu {
  width: 220px;
  background-color: var(--primary-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
}

.side-menu.collapsed {
  width: 64px;
}

.side-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--border-color);
}

.side-menu.collapsed .side-header {
  justify-content: center;
  padding: 0;
}

.side-menu.collapsed .logo-placeholder {
  margin-right: 0;
}

.menu-wrapper {
  flex: 1;
  border-right: none;
}

.main-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-header {
  height: 60px;
  background-color: var(--card-background);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.collapse-btn {
  margin-right: 8px;
}

.page-title {
  margin: 0;
  font-size: 18px;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: var(--primary-color);
}
</style>
