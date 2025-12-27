<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <h2>麦麦笔记本</h2>
      <h3>注册</h3>
      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerFormRef"
        label-position="left"
        label-width="90px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            :prefix-icon="Message"
          ></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="verification_code">
          <div class="code-input-wrapper">
            <el-input
              v-model="registerForm.verification_code"
              placeholder="请输入验证码"
              :prefix-icon="CircleCheck"
              style="width: 65%"
            ></el-input>
            <el-button
              type="primary"
              @click="sendVerificationCode"
              :disabled="countdown > 0"
              style="width: 30%; margin-left: 5%"
            >
              {{ countdown > 0 ? `${countdown}s后重试` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" class="register-btn">注册</el-button>
          <el-link type="primary" @click="$router.push('/login')" class="login-link">去登录</el-link>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { register, sendVerificationCode as sendVerificationCodeApi } from '@/api/user'
import { handleApiError } from '@/utils/api'

const router = useRouter()
const registerFormRef = ref()
const countdown = ref(0)
let countdownTimer = null

const registerForm = reactive({
  username: '',
  password: '',
  email: '',
  verification_code: ''
})

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度在 6 到 30 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  verification_code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const sendVerificationCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.email)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }

  try {
    // 发送验证码
    const response = await sendVerificationCodeApi(registerForm.email)
    if (response.success) {
      ElMessage.success('验证码发送成功')
      
      // 开始倒计时
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer)
        }
      }, 1000)
    } else {
      ElMessage.error(response.message || '验证码发送失败')
    }
  } catch (error) {
    console.error('发送验证码错误:', error)
    const errorMessage = handleApiError(error, '验证码发送失败，请检查网络连接')
    ElMessage.error(errorMessage)
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 发起注册请求
        const response = await register(
          registerForm.username,
          registerForm.password,
          registerForm.email,
          registerForm.verification_code
        )
        
        if (response.success) {
          ElMessage.success('注册成功')
          
          // 跳转到登录页，并自动填入注册信息
          router.push({
            path: '/login',
            query: {
              username: registerForm.username,
              password: registerForm.password
            }
          })
        } else {
          ElMessage.error(response.message || '注册失败')
        }
      } catch (error) {
        console.error('注册错误:', error)
        const errorMessage = handleApiError(error, '注册失败，请检查网络连接')
        ElMessage.error(errorMessage)
      }
    } else {
      return false
    }
  })
}
</script>

<style scoped>
.register-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--primary-color);
}

.register-form-wrapper {
  width: 450px;
  padding: 40px;
  background-color: var(--card-background);
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

h2 {
  color: var(--secondary-color);
  text-align: center;
  margin-bottom: 10px;
  font-size: 28px;
}

h3 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 18px;
  color: var(--text-color);
}

.code-input-wrapper {
  display: flex;
  align-items: center;
}

.register-btn {
  width: 100%;
  margin-bottom: 10px;
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.login-link {
  display: block;
  text-align: center;
}
</style>