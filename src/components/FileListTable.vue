<template>
  <el-table
    v-if="items && items.length"
    :data="items"
    size="small"
    border
  >
    <el-table-column
      prop="original_name"
      label="文件名"
      min-width="260"
    />
    <el-table-column
      prop="file_size"
      label="大小"
      width="120"
    >
      <template #default="scope">
        {{ formatFileSize(scope.row.file_size) }}
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      :width="actionColumnWidth"
    >
      <template #default="scope">
        <el-button
          type="primary"
          text
          size="small"
          @click="handleDownload(scope.row)"
        >
          {{ downloadText }}
        </el-button>
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
import { formatFileSize } from '@/utils/api'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
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

const emit = defineEmits(['download', 'delete'])

const actionColumnWidth = computed(() => (props.showDelete ? 160 : 100))

const handleDownload = (row) => {
  emit('download', row)
}

const handleDelete = (row) => {
  emit('delete', row)
}
</script>

<style scoped>
</style>

