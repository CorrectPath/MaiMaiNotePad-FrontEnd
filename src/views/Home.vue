<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="header-left">
        <div class="logo-wrapper">
          <div class="logo-placeholder">Logo预留</div>
          <div class="product-info">
            <h1>麦麦笔记本</h1>
            <p class="slogan">产品宣传语预留</p>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-avatar
          :size="40"
          :src="userAvatar"
          class="user-avatar"
        >
          <template #default>
            <UserFilled />
          </template>
        </el-avatar>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧路由栏 -->
      <aside class="side-menu">
        <el-menu
          default-active="/persona-card"
          class="menu-wrapper"
          router
          :unique-opened="true"
        >
          <el-menu-item index="/persona-card">
            <template #title>
              <span>人设卡</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/knowledge-base">
            <template #title>
              <span>知识库</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/user-center">
            <template #title>
              <span>个人中心</span>
            </template>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 右侧内容区 -->
      <div class="content-wrapper">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { getCurrentUser } from '@/api/user'
import { handleApiError } from '@/utils/api'

const userAvatar = ref('')

// 获取用户头像
const getUserInfo = async () => {
  try {
    const response = await getCurrentUser()
    if (response.success) {
      // 根据API文档，头像URL在avatar_url字段中
      userAvatar.value = response.data.avatar_url 
        ? `${import.meta.env.VUE_APP_API_BASE_URL.replace('/api', '')}${response.data.avatar_url}` 
        : ''
    } else {
      console.error('获取用户信息失败:', response.message)
    }
  } catch (error) {
    console.error('获取用户信息错误:', error)
    const errorMessage = handleApiError(error, '获取用户信息失败，请检查网络连接')
    console.error('获取用户信息错误:', errorMessage)
  }
}

onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
  background-color: var(--primary-color);
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
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-wrapper {
  display: flex;
  align-items: center;
}

.logo-placeholder {
  width: 40px;
  height: 40px;
  background-color: var(--secondary-color);
  border-radius: 5px;
  margin-right: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--primary-color);
  font-weight: bold;
}

.product-info h1 {
  color: var(--secondary-color);
  font-size: 20px;
  margin: 0;
}

.slogan {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-avatar {
  cursor: pointer;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.side-menu {
  width: 200px;
  background-color: var(--primary-color);
  border-right: 1px solid var(--border-color);
}

.menu-wrapper {
  height: 100%;
  border-right: none;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: var(--primary-color);
}
</style>