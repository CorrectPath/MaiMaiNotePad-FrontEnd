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
        <el-form-item label="确认密码" prop="confirm_password">
          <el-input
            v-model="registerForm.confirm_password"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <div class="email-input-wrapper">
            <el-input
              v-model="registerForm.emailLocal"
              placeholder="请输入邮箱"
              :prefix-icon="Message"
              style="flex: 1"
            ></el-input>
            <span class="email-suffix">.com</span>
          </div>
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
import { register, sendVerificationCode as sendVerificationCodeApi, checkRegisterLegality } from '@/api/user'
import { handleApiError, showApiErrorNotification, showErrorNotification, showSuccessNotification, showWarningNotification } from '@/utils/api'

const router = useRouter()
const registerFormRef = ref()
const countdown = ref(0)
let countdownTimer = null

const registerForm = reactive({
  username: '',
  password: '',
  email: '',
  emailLocal: '',
  confirm_password: '',
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
  confirm_password: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请再次输入密码'))
        } else if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const fullEmail = registerForm.emailLocal + '.com'
        if (!fullEmail) {
          callback(new Error('请输入邮箱'))
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(fullEmail)) {
            callback(new Error('请输入有效的邮箱地址'))
          } else {
            callback()
          }
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  verification_code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const sendVerificationCode = async () => {
  if (!registerForm.username) {
    showWarningNotification('请先输入用户名')
    return
  }

  if (!registerForm.emailLocal) {
    showWarningNotification('请先输入邮箱前缀')
    return
  }

  const fullEmail = registerForm.emailLocal + '.com'

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(fullEmail)) {
    showWarningNotification('请输入有效的邮箱地址')
    return
  }

  try {
    const checkResponse = await checkRegisterLegality(registerForm.username, fullEmail)
    if (!checkResponse.success) {
      showErrorNotification(checkResponse.message || '注册信息不合法，请检查用户名和邮箱')
      return
    }

    const response = await sendVerificationCodeApi(fullEmail)
    if (response.success) {
      showSuccessNotification('验证码发送成功')
      
      // 开始倒计时
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer)
        }
      }, 1000)
    } else {
      showErrorNotification(response.message || '验证码发送失败')
    }
  } catch (error) {
    console.error('发送验证码错误:', error)
    showApiErrorNotification(error, '验证码发送失败，请检查网络连接')
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const fullEmail = registerForm.emailLocal + '.com'
        const response = await register(
          registerForm.username,
          registerForm.password,
          fullEmail,
          registerForm.verification_code
        )
        
        if (response.success) {
          showSuccessNotification('注册成功')
          
          // 跳转到登录页，并自动填入注册信息
          router.push({
            path: '/login',
            query: {
              username: registerForm.username,
              password: registerForm.password
            }
          })
        } else {
          showErrorNotification(response.message || '注册失败')
        }
      } catch (error) {
        console.error('注册错误:', error)
        showApiErrorNotification(error, '注册失败，请检查网络连接')
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

.email-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.email-suffix {
  margin-left: 10px;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--card-background);
  color: var(--text-color);
  font-size: 14px;
  box-sizing: border-box;
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
