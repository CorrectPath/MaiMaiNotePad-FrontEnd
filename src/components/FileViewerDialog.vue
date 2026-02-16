<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    destroy-on-close
    class="file-viewer-dialog"
  >
    <div class="file-viewer-body">
      <div class="file-viewer-meta">
        <span class="file-language-tag">{{ languageLabel }}</span>
        <el-button
          class="wrap-toggle-btn"
          text
          size="small"
          @click="toggleWrap"
        >
          {{ wrapEnabled ? '取消换行' : '自动换行' }}
        </el-button>
      </div>
      <div class="file-viewer-content" v-if="!loading">
        <div ref="editorContainer" class="monaco-editor-container"></div>
      </div>
      <div v-else class="file-viewer-loading">
        <el-skeleton :rows="10" animated />
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleDownload">
        <el-icon>
          <Download />
        </el-icon>
        下载文件
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/min/vs/editor/editor.main.css'
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding'
import { Download } from '@element-plus/icons-vue'

let jsonFoldingProviderRegistered = false

const ensureJsonFolding = () => {
  if (jsonFoldingProviderRegistered) {
    return
  }
  jsonFoldingProviderRegistered = true
  try {
    monaco.languages.register({ id: 'json' })
  } catch (e) {}
  monaco.languages.registerFoldingRangeProvider('json', {
    provideFoldingRanges(model) {
      const ranges = []
      const stack = []
      const lineCount = model.getLineCount()
      for (let lineNumber = 1; lineNumber <= lineCount; lineNumber += 1) {
        const text = model.getLineContent(lineNumber)
        for (let i = 0; i < text.length; i += 1) {
          const ch = text[i]
          if (ch === '{' || ch === '[') {
            stack.push({ start: lineNumber })
          } else if (ch === '}' || ch === ']') {
            if (stack.length) {
              const last = stack.pop()
              if (lineNumber > last.start) {
                ranges.push({
                  start: last.start,
                  end: lineNumber,
                  kind: monaco.languages.FoldingRangeKind.Region
                })
              }
            }
          }
        }
      }
      return ranges
    }
  })
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'download'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => {
    emit('update:visible', value)
  }
})

const dialogTitle = computed(() => {
  if (props.title) {
    return props.title
  }
  if (props.fileName) {
    return `预览 - ${props.fileName}`
  }
  return '文件预览'
})

const resolvedLanguage = computed(() => {
  if (props.language) {
    return props.language
  }
  const name = props.fileName || ''
  const index = name.lastIndexOf('.')
  if (index !== -1) {
    const ext = name.slice(index + 1).toLowerCase()
    if (ext === 'json' || ext === 'toml' || ext === 'txt') {
      return ext
    }
  }
  return 'txt'
})

const languageLabel = computed(() => {
  const lang = resolvedLanguage.value
  if (lang === 'json') {
    return 'JSON'
  }
  if (lang === 'toml') {
    return 'TOML'
  }
  return 'TEXT'
})

const wrapEnabled = ref(false)
const editorContainer = ref(null)
let editorInstance = null

const previewSource = computed(() => {
  const value = props.content || ''
  if (!value) {
    return ''
  }
  const lang = resolvedLanguage.value
  if (lang === 'json') {
    try {
      const parsed = JSON.parse(value)
      return JSON.stringify(parsed, null, 2)
    } catch (error) {
      return value
    }
  }
  return value
})

const monacoLanguage = computed(() => {
  const lang = resolvedLanguage.value
  if (lang === 'json') {
    return 'json'
  }
  return 'plaintext'
})

const createEditor = () => {
  if (!editorContainer.value) {
    return
  }
  if (editorInstance) {
    editorInstance.dispose()
    editorInstance = null
  }
  if (monacoLanguage.value === 'json') {
    ensureJsonFolding()
  }
  monaco.editor.setTheme('vs-dark')
  editorInstance = monaco.editor.create(editorContainer.value, {
    value: previewSource.value,
    language: monacoLanguage.value,
    readOnly: true,
    wordWrap: wrapEnabled.value ? 'on' : 'off',
    lineNumbers: 'on',
    glyphMargin: true,
    showFoldingControls: 'always',
    minimap: {
      enabled: false
    },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    folding: true
  })
}

const updateEditorContent = () => {
  if (!editorInstance) {
    return
  }
  const model = editorInstance.getModel()
  const value = previewSource.value || ''
  if (model) {
    model.setValue(value)
    monaco.editor.setModelLanguage(model, monacoLanguage.value)
  } else {
    editorInstance.setValue(value)
  }
}

const toggleWrap = () => {
  wrapEnabled.value = !wrapEnabled.value
}

watch(
  () => props.content,
  () => {
    wrapEnabled.value = true
    nextTick(() => {
      if (editorInstance) {
        updateEditorContent()
        editorInstance.updateOptions({
          wordWrap: wrapEnabled.value ? 'on' : 'off'
        })
      } else if (dialogVisible.value) {
        createEditor()
      }
    })
  }
)

watch(
  () => wrapEnabled.value,
  (enabled) => {
    if (!editorInstance) {
      return
    }
    editorInstance.updateOptions({
      wordWrap: enabled ? 'on' : 'off'
    })
  }
)

watch(
  () => dialogVisible.value,
  (visible) => {
    if (visible) {
      nextTick(() => {
        createEditor()
      })
    } else if (editorInstance) {
      editorInstance.dispose()
      editorInstance = null
    }
  }
)

onMounted(() => {
  if (dialogVisible.value) {
    createEditor()
  }
})

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose()
    editorInstance = null
  }
})

const handleDownload = () => {
  emit('download')
}
</script>

<style scoped>
.file-viewer-dialog :deep(.el-dialog__body) {
  padding: 16px 20px;
}

.file-viewer-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-viewer-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 13px;
  color: var(--muted-text-color);
}

.file-language-tag {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(246, 196, 83, 0.4);
  font-size: 11px;
}

.wrap-toggle-btn {
  margin-left: 8px;
}

.file-truncate-tip {
  margin-left: 8px;
  font-size: 11px;
  opacity: 0.8;
}

.file-viewer-content {
  max-height: 520px;
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--hover-color);
  border: 1px solid var(--border-color);
}

.code-block {
  margin: 0;
  padding: 12px 14px;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre;
}

.file-viewer-loading {
  padding: 12px;
}

.monaco-editor-container {
  width: 100%;
  height: 520px;
}

.code-editor {
  display: flex;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.code-editor-gutter {
  flex: 0 0 auto;
  padding: 12px 6px 12px 10px;
  text-align: right;
  user-select: none;
  border-right: 1px solid var(--border-color);
  background-color: rgba(0, 0, 0, 0.08);
}

.code-line-number {
  color: var(--muted-text-color);
  padding: 0 4px;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.code-line-number-text {
  min-width: 24px;
  text-align: right;
}

.code-fold-marker {
  width: 10px;
  margin-right: 4px;
  font-size: 10px;
}

.code-line-number.is-foldable {
  cursor: pointer;
}

.code-line-number.is-foldable:hover {
  color: var(--secondary-color);
}

.code-editor-lines {
  flex: 1 1 auto;
  padding: 12px 14px;
}

.code-line {
}

.code-line-pre {
  margin: 0;
  white-space: pre;
}

.code-editor.is-wrap-enabled .code-line-pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
