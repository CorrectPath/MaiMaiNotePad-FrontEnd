<template>
  <el-table v-if="items && items.length" :data="items" size="small" border>
    <el-table-column
      prop="original_name"
      label="文件名"
      min-width="260"
    />
    <el-table-column
      prop="file_size"
      label="大小"
      width="120"
      align="center"
      header-align="center"
    >
      <template #default="scope">
        {{ formatFileSize(scope.row.file_size) }}
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      :width="actionColumnWidth"
      align="center"
      header-align="center"
    >
      <template #default="scope">
        <el-tooltip
          v-if="showPreview"
          content="浏览文件"
          placement="top"
        >
          <el-button
            type="primary"
            text
            circle
            size="small"
            @click="handlePreview(scope.row)"
          >
            <el-icon>
              <View />
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip
          content="下载文件"
          placement="top"
        >
          <el-button
            type="primary"
            text
            circle
            size="small"
            @click="handleDownload(scope.row)"
          >
            <el-icon>
              <Download />
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-button
          v-if="showDelete"
          type="danger"
          text
          size="small"
          @click="handleDelete(scope.row)"
        >
          {{ deleteText }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { View, Download } from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/api'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  showPreview: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  downloadText: {
    type: String,
    default: '下载'
  },
  deleteText: {
    type: String,
    default: '删除'
  }
})

const emit = defineEmits(['preview', 'download', 'delete'])

const actionColumnWidth = computed(() => 140)

const handlePreview = (row) => {
  emit('preview', row)
}

const handleDownload = (row) => {
  emit('download', row)
}

const handleDelete = (row) => {
  emit('delete', row)
}
</script>

<style scoped>
</style>
