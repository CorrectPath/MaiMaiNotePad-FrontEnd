import { defineStore } from 'pinia'
import { getMessages, markMessageRead } from '@/api/messages'
import { handleApiError } from '@/utils/api'
import { ElMessage } from 'element-plus'

export const useMessageStore = defineStore('messages', {
  state: () => ({
    items: [],
    loading: false,
    loaded: false,
    page: 1,
    pageSize: 20
  }),
  getters: {
    unreadCount: (state) => state.items.filter((item) => !item.is_read).length
  },
  actions: {
    async fetchMessages(force = false) {
      if (this.loading) {
        return
      }
      if (this.loaded && !force && this.items.length) {
        return
      }
      this.loading = true
      try {
        const response = await getMessages(this.page, this.pageSize)
        if (response && response.success) {
          this.items = response.data || []
          this.loaded = true
        } else if (response && response.data) {
          this.items = response.data || []
          this.loaded = true
        } else {
          ElMessage.error((response && response.message) || '获取消息列表失败')
        }
      } catch (error) {
        const errorMessage = handleApiError(error, '获取消息列表失败，请检查网络连接')
        ElMessage.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    async refreshMessages() {
      await this.fetchMessages(true)
    },
    async markAllRead() {
      const unreadMessages = this.items.filter((item) => !item.is_read)
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
    },
    async markRead(message) {
      if (!message || !message.id) {
        return
      }
      if (message.is_read) {
        return
      }
      try {
        const response = await markMessageRead(message.id)
        if (response && response.success) {
          message.is_read = true
        } else if (response && response.message) {
          ElMessage.error(response.message)
        }
      } catch (error) {
        const errorMessage = handleApiError(error, '标记消息已读失败，请检查网络连接')
        ElMessage.error(errorMessage)
      }
    }
  }
})

