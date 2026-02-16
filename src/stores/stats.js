import { defineStore } from 'pinia'
import { getMyUploadStats, getAdminUploadStats } from '@/api/stats'
import { handleApiError } from '@/utils/api'
import { ElMessage } from 'element-plus'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    myStats: null,
    myStatsLoaded: false,
    myStatsLoading: false,
    adminStats: null,
    adminStatsLoaded: false,
    adminStatsLoading: false
  }),
  actions: {
    async fetchMyStats(force = false) {
      if (this.myStatsLoading) {
        return
      }
      if (this.myStatsLoaded && !force && this.myStats) {
        return
      }
      this.myStatsLoading = true
      try {
        const response = await getMyUploadStats()
        if (response && response.success && response.data) {
          this.myStats = response.data
          this.myStatsLoaded = true
        } else if (response && response.data) {
          this.myStats = response.data
          this.myStatsLoaded = true
        } else {
          ElMessage.error((response && response.message) || '获取上传统计失败')
        }
      } catch (error) {
        const errorMessage = handleApiError(error, '获取上传统计失败，请检查网络连接')
        ElMessage.error(errorMessage)
      } finally {
        this.myStatsLoading = false
      }
    },
    async fetchAdminStats(force = false) {
      if (this.adminStatsLoading) {
        return
      }
      if (this.adminStatsLoaded && !force && this.adminStats) {
        return
      }
      this.adminStatsLoading = true
      try {
        const response = await getAdminUploadStats()
        if (response && response.success && response.data) {
          this.adminStats = response.data
          this.adminStatsLoaded = true
        } else if (response && response.data) {
          this.adminStats = response.data
          this.adminStatsLoaded = true
        } else {
          ElMessage.error((response && response.message) || '获取系统统计失败')
        }
      } catch (error) {
        const errorMessage = handleApiError(error, '获取系统统计失败，请检查网络连接')
        ElMessage.error(errorMessage)
      } finally {
        this.adminStatsLoading = false
      }
    }
  }
})

