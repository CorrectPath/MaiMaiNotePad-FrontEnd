import { DEFAULT_API_PORT } from '@/api'

const getWsBaseUrl = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL
  if (envBase && typeof envBase === 'string' && envBase.startsWith('http')) {
    let base = envBase.replace(/^http/, 'ws')
    if (!base.endsWith('/')) {
      base += '/'
    }
    return base
  }
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
  const host = window.location.hostname
  const port = DEFAULT_API_PORT
  let basePath = envBase && typeof envBase === 'string' && envBase.length > 0 ? envBase : '/api'
  if (!basePath.startsWith('/')) {
    basePath = `/${basePath}`
  }
  if (!basePath.endsWith('/')) {
    basePath += '/'
  }
  return `${protocol}${host}:${port}${basePath}`
}

let statusListeners = []

const notifyStatus = (status) => {
  if (!statusListeners.length) {
    return
  }
  statusListeners.forEach((listener) => {
    if (typeof listener === 'function') {
      try {
        listener(status)
      } catch (e) {}
    }
  })
}

const websocket = {
  websocket: null,
  connectUrl: '',
  socketOpen: false,
  heartbeatTimer: null,
  heartbeatInterval: 20000,
  isReconnect: true,
  reconnectCount: 3,
  reconnectCurrent: 1,
  reconnectTimer: null,
  reconnectInterval: 5000,
  messageHandler: null,
  init(receiveMessage) {
    if (typeof receiveMessage === 'function') {
      this.messageHandler = receiveMessage
    }
    if (typeof window === 'undefined' || !('WebSocket' in window)) {
      this.socketOpen = false
      notifyStatus('closed')
      return
    }
    const token = localStorage.getItem('access_token')
    if (!token) {
      this.socketOpen = false
      notifyStatus('closed')
      return
    }
    if (this.websocket && this.socketOpen) {
      notifyStatus('open')
      return
    }
    const wsUrl = `${getWsBaseUrl()}ws/${token}`
    this.connectUrl = wsUrl
    const ws = new WebSocket(wsUrl)
    this.websocket = ws

    ws.onopen = () => {
      this.socketOpen = true
      this.isReconnect = true
      this.reconnectCurrent = 1
      this.heartbeat()
      notifyStatus('open')
    }

    ws.onmessage = (event) => {
      notifyStatus('message')
      if (this.messageHandler) {
        this.messageHandler(event)
      }
    }

    ws.onclose = () => {
      this.socketOpen = false
      notifyStatus('closed')
      if (this.isReconnect) {
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer)
        }
        this.reconnectTimer = setTimeout(() => {
          if (this.reconnectCurrent > this.reconnectCount) {
            this.isReconnect = false
            return
          }
          this.reconnectCurrent += 1
          this.reconnect()
        }, this.reconnectInterval)
      }
    }

    ws.onerror = () => {
      this.socketOpen = false
      notifyStatus('error')
    }
  },
  heartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }
    this.heartbeatTimer = setInterval(() => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        return
      }
      const data = { token }
      this.send(data)
    }, this.heartbeatInterval)
  },
  send(data) {
    if (!this.websocket) {
      this.socketOpen = false
      notifyStatus('closed')
      return
    }
    if (this.websocket.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data)
      this.websocket.send(payload)
    } else {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
      this.socketOpen = false
      notifyStatus('closed')
    }
  },
  close() {
    this.isReconnect = false
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    if (this.websocket) {
      try {
        this.websocket.close()
      } catch (e) {}
      this.websocket = null
    }
    this.socketOpen = false
    notifyStatus('closed')
  },
  reconnect() {
    if (this.websocket) {
      this.close()
    }
    this.init(this.messageHandler)
  },
  subscribeStatus(listener) {
    if (typeof listener !== 'function') {
      return
    }
    statusListeners.push(listener)
  },
  unsubscribeStatus(listener) {
    if (!statusListeners.length) {
      return
    }
    if (!listener) {
      statusListeners = []
      return
    }
    const index = statusListeners.indexOf(listener)
    if (index !== -1) {
      statusListeners.splice(index, 1)
    }
  }
}

export default websocket
