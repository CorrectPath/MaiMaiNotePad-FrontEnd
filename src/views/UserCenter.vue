<template>
  <div class="user-center-container">
    <el-card class="user-card">
      <h2>个人中心</h2>
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
          <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { changePassword } from '@/api/user'
import { handleApiError } from '@/utils/api'

const passwordFormRef = ref()

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
</script>

<style scoped>
.user-center-container {
  padding: 20px;
  color: var(--text-color);
  display: flex;
  justify-content: center;
}

.user-card {
  width: 500px;
}

.password-form {
  margin-top: 20px;
}
</style>
