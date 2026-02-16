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
        <el-sub-menu index="/square-group">
          <template #title>
            <el-icon>
              <Collection />
            </el-icon>
            <span class="menu-label">广场</span>
          </template>
          <el-menu-item index="/persona-card">
            <span class="menu-label">人设卡广场</span>
          </el-menu-item>
          <el-menu-item index="/knowledge-base">
            <span class="menu-label">知识库广场</span>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/my-group">
          <template #title>
            <el-icon>
              <UserFilled />
            </el-icon>
            <span class="menu-label">我的</span>
          </template>
          <el-menu-item index="/my-persona">
            <span class="menu-label">我的人设卡</span>
          </el-menu-item>
          <el-menu-item index="/my-knowledge">
            <span class="menu-label">我的知识库</span>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu v-if="isAdmin" index="/review-group">
          <template #title>
            <el-icon>
              <Check />
            </el-icon>
            <span class="menu-label">审核列表</span>
          </template>
          <el-menu-item index="/knowledge-review">
            <span class="menu-label">知识库审核</span>
          </el-menu-item>
          <el-menu-item index="/persona-review">
            <span class="menu-label">人设卡审核</span>
          </el-menu-item>
        </el-sub-menu>
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
                <div class="message-list-actions">
                  <el-button
                    v-if="unreadCount > 1"
                    class="message-mark-all-btn"
                    text
                    @click.stop="handleMarkAllRead"
                  >
                    一键已读
                  </el-button>
                  <el-button class="message-refresh-btn" text circle @click.stop="refreshMessages">
                    <el-icon>
                      <RefreshRight />
                    </el-icon>
                  </el-button>
                </div>
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

          <el-dialog
            v-model="messageDialogVisible"
            :title="selectedMessage ? selectedMessage.title : ''"
            width="480px"
            destroy-on-close
          >
            <div class="message-dialog-content" v-if="selectedMessage">
              <div class="message-dialog-meta">
                <span>时间：{{ formatMessageTime(selectedMessage.created_at) }}</span>
              </div>
              <div class="message-dialog-body">
                {{ selectedMessage.content }}
              </div>
            </div>
            <template #footer>
              <div class="message-dialog-footer">
                <div class="message-dialog-footer-left">
                  <el-button
                    v-if="hasPrevMessage"
                    class="message-nav-btn"
                    plain
                    size="small"
                    @click="handleShowPrevMessage"
                  >
                    上一条
                  </el-button>
                </div>
                <div class="message-dialog-footer-right">
                  <el-button
                    v-if="hasNextMessage"
                    class="message-nav-btn"
                    plain
                    size="small"
                    @click="handleShowNextMessage"
                  >
                    下一条
                  </el-button>
                </div>
              </div>
            </template>
          </el-dialog>

          <el-dropdown @command="handleUserCommand">
            <span class="user-dropdown-trigger">
              <div class="user-avatar-wrapper">
                <el-avatar
                  :size="32"
                  :src="userAvatar"
                  class="user-avatar"
                >
                  <template #default>
                    <UserFilled />
                  </template>
                </el-avatar>
                <span
                  class="user-status-dot"
                  :class="isOnline ? 'user-status-online' : 'user-status-offline'"
                ></span>
              </div>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="user-center">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">登出</el-dropdown-item>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UserFilled, Collection, Fold, Expand, Bell, RefreshRight, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCurrentUser } from '@/api/user'
import { handleApiError } from '@/utils/api'
import { getMessages, markMessageRead } from '@/api/messages'
import websocket from '@/utils/websocket'

const router = useRouter()
const route = useRoute()
const userAvatar = ref('')
const userRole = ref('user')
const isOnline = ref(false)
let messagePollTimer = null
const apiBase = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:9278/api`
const isCollapsed = ref(false)
const messages = ref([])
const messageLoading = ref(false)
const messagePopoverVisible = ref(false)
const messageDialogVisible = ref(false)
const selectedMessage = ref(null)

const isAdmin = computed(() => {
  return userRole.value === 'admin'
})

const unreadCount = computed(() => {
  return messages.value.filter((item) => !item.is_read).length
})

const currentMessageIndex = computed(() => {
  if (!selectedMessage.value) {
    return -1
  }
  return messages.value.findIndex((item) => item.id === selectedMessage.value.id)
})

const hasPrevMessage = computed(() => {
  return currentMessageIndex.value > 0
})

const hasNextMessage = computed(() => {
  return currentMessageIndex.value >= 0 && currentMessageIndex.value < messages.value.length - 1
})

const resolveAvatarUrl = (userData) => {
  if (!userData || !userData.id) {
    return ''
  }
  const base = apiBase || ''
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base
  let url = `${trimmedBase}/users/${userData.id}/avatar?size=64`
  if (userData.avatar_updated_at) {
    url += `&t=${encodeURIComponent(userData.avatar_updated_at)}`
  }
  return url
}

const pageTitleMap = {
  '/persona-card': '人设卡广场',
  '/my-persona': '我的人设卡',
  '/persona-upload': '创建人设卡',
  '/persona-review': '人设卡审核',
  '/knowledge-base': '知识库广场',
  '/my-knowledge': '我的知识库',
  '/knowledge-review': '知识库审核',
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
  if (messageLoading.value) {
    return
  }
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

const handleWebsocketMessage = () => {
  fetchMessages()
}

const handleMarkAllRead = async () => {
  const unreadMessages = messages.value.filter((item) => !item.is_read)
  if (!unreadMessages.length) {
    return
  }
  try {
    const tasks = unreadMessages.map((msg) =>
      markMessageRead(msg.id).then((response) => {
        if (response && response.success) {
          msg.is_read = true
        }
      })
    )
    await Promise.all(tasks)
  } catch (error) {
    const errorMessage = handleApiError(error, '一键标记已读失败，请检查网络连接')
    ElMessage.error(errorMessage)
  }
}

const getUserInfo = async () => {
  try {
    const response = await getCurrentUser()
    if (response && response.success) {
      const data = response.data || {}
      userAvatar.value = resolveAvatarUrl(data)
      userRole.value = data.role || 'user'
    } else if (response && response.data) {
      const data = response.data
      userAvatar.value = resolveAvatarUrl(data)
      userRole.value = data.role || 'user'
    } else {
      console.error('获取用户信息失败:', response && response.message)
    }
  } catch (error) {
    console.error('获取用户信息错误:', error)
    const errorMessage = handleApiError(error, '获取用户信息失败，请检查网络连接')
    console.error('获取用户信息错误:', errorMessage)
  }
}

const handleMessageClick = async (msg) => {
  if (!msg) {
    return
  }
  messagePopoverVisible.value = false
  selectedMessage.value = msg
  messageDialogVisible.value = true

  if (msg.is_read) {
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

const showMessageAtIndex = async (index) => {
  if (index < 0 || index >= messages.value.length) {
    return
  }
  const msg = messages.value[index]
  if (!msg) {
    return
  }
  messagePopoverVisible.value = false
  selectedMessage.value = msg
  messageDialogVisible.value = true

  if (msg.is_read) {
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

const handleShowPrevMessage = () => {
  if (!hasPrevMessage.value) {
    return
  }
  const targetIndex = currentMessageIndex.value - 1
  showMessageAtIndex(targetIndex)
}

const handleShowNextMessage = () => {
  if (!hasNextMessage.value) {
    return
  }
  const targetIndex = currentMessageIndex.value + 1
  showMessageAtIndex(targetIndex)
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleUserCommand = (command) => {
  if (command === 'user-center') {
    router.push('/user-center')
  } else if (command === 'logout') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('rememberedLogin')
    window.location.href = '/login'
  }
}

onMounted(() => {
  getUserInfo()
  fetchMessages()
  websocket.subscribeStatus((status) => {
    if (status === 'open' || status === 'message') {
      isOnline.value = true
    } else if (status === 'closed' || status === 'error') {
      isOnline.value = false
    }
  })
  websocket.init(handleWebsocketMessage)
  if (!messagePollTimer) {
    messagePollTimer = setInterval(() => {
      fetchMessages()
    }, 10000)
  }
})

onUnmounted(() => {
  if (messagePollTimer) {
    clearInterval(messagePollTimer)
    messagePollTimer = null
  }
  websocket.unsubscribeStatus()
  websocket.close()
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

.user-avatar-wrapper {
  position: relative;
  display: inline-flex;
}

.user-avatar {
  cursor: pointer;
  width: 32px;
  height: 32px;
}

.user-dropdown-trigger {
  display: inline-flex;
  align-items: center;
}

.user-status-dot {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  border: 2px solid var(--card-background);
  box-sizing: border-box;
}

.user-status-online {
  background-color: #52c41a;
}

.user-status-offline {
  background-color: #bfbfbf;
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

.message-list-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.message-mark-all-btn {
  font-size: 12px;
  padding: 0 6px;
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
  line-clamp: 2;
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

.message-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-dialog-meta {
  font-size: 12px;
  color: var(--muted-text-color);
}

.message-dialog-body {
  font-size: 14px;
  line-height: 1.6;
  height: 260px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.message-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
}

.message-nav-btn {
  min-width: 80px;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 9999px;
  background-color: transparent;
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
