<template>
  <div class="knowledge-upload-container">
    <div class="layout-container">
      <el-card class="upload-card" shadow="hover">
        <div class="card-header">
          <div class="card-title-group">
            <h2 class="page-title">上传知识库</h2>
            <p class="page-subtitle">支持上传多个文本文件组成一个知识库</p>
          </div>
          <div class="card-actions">
            <el-button type="default" @click="goBackToList">
              返回我的知识库
            </el-button>
          </div>
        </div>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          class="upload-form"
        >
          <el-form-item label="知识库名称" prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入知识库名称"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="知识库描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入知识库的用途或简介"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="版权所有者">
            <el-input
              v-model="form.copyright_owner"
              placeholder="默认使用当前用户名，可选填"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="公开范围">
            <el-radio-group v-model="form.visibility">
              <el-radio label="private">仅自己可见</el-radio>
              <el-radio label="public">申请公开到知识库广场（需审核）</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="标签">
            <el-input
              v-model="form.tags"
              placeholder="请输入标签，使用逗号分隔"
            />
          </el-form-item>
          <el-form-item label="补充说明">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="3"
              placeholder="可填写知识库整体说明或备注"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="知识库文件" required>
            <el-upload
              class="upload-area"
              drag
              multiple
              :auto-upload="false"
              :file-list="fileList"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :limit="100"
              accept=".txt,.json"
            >
              <el-icon class="upload-icon">
                <UploadFilled />
              </el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或
                <em>点击选择文件</em>
              </div>
              <div class="el-upload__tip">
                仅支持 .txt/.json 文件，最多 100 个，单个文件不超过 100MB
              </div>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="submitting"
              @click="handleSubmit"
            >
              提交上传
            </el-button>
            <el-button @click="resetForm" :disabled="submitting">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { uploadKnowledgeBase } from '@/api/knowledge'
import { handleApiError } from '@/utils/api'

const router = useRouter()

const formRef = ref()

const form = reactive({
  name: '',
  description: '',
  copyright_owner: '',
  visibility: 'private',
  tags: '',
  content: ''
})

const rules = {
  name: [
    { required: true, message: '请输入知识库名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入知识库描述', trigger: 'blur' }
  ]
}

const fileList = ref([])
const submitting = ref(false)

const handleFileChange = (file, files) => {
  fileList.value = files
}

const handleFileRemove = (file, files) => {
  fileList.value = files
}

const buildFormData = () => {
  const formData = new FormData()
  fileList.value.forEach((item) => {
    const raw = item.raw || item
    if (raw) {
      formData.append('files', raw)
    }
  })
  formData.append('name', form.name)
  formData.append('description', form.description)
  if (form.visibility === 'public') {
    formData.append('is_public', 'true')
  }
  if (form.copyright_owner) {
    formData.append('copyright_owner', form.copyright_owner)
  }
  if (form.content) {
    formData.append('content', form.content)
  }
  if (form.tags) {
    formData.append('tags', form.tags)
  }
  return formData
}

const handleSubmit = () => {
  if (!formRef.value) {
    return
  }
  formRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    if (!fileList.value.length) {
      ElMessage.error('请至少选择一个文件')
      return
    }
    submitting.value = true
    try {
      const formData = buildFormData()
      const response = await uploadKnowledgeBase(formData)
      if (response.success) {
        ElMessage.success(response.message || '知识库上传成功')
        resetForm()
      } else {
        ElMessage.error(response.message || '知识库上传失败')
      }
    } catch (error) {
      const message = handleApiError(error, '知识库上传失败')
      ElMessage.error(message)
    } finally {
      submitting.value = false
    }
  })
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.copyright_owner = ''
  form.tags = ''
  form.content = ''
  fileList.value = []
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const goBackToList = () => {
  router.push('/my-knowledge')
}
</script>

<style scoped>
.knowledge-upload-container {
  padding: 24px;
}

.layout-container {
  max-width: 960px;
  margin: 0 auto;
}

.upload-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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
  color: #909399;
  font-size: 13px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-form {
  margin-top: 8px;
}

.upload-area {
  width: 100%;
}

.upload-icon {
  font-size: 40px;
  color: var(--secondary-color);
}
</style>
