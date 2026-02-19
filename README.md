# MaiMaiNotePad 前端应用

这是 MaiMaiNotePad/MaiMNP 的前端项目，基于 Vue 3 + Vite + Element Plus 构建，为后端提供的知识库管理、人设卡管理、用户系统等功能提供 Web 界面。

后端项目对应目录为：`../MaiMaiNotePad-BackEnd`，两者配合运行即可完成完整功能体验。

---

## 🚀 功能特性

### 用户与认证
- 用户注册、登录、退出
- 记住账号信息（可选）
- 基于 JWT 的前端鉴权
- 自动在请求中附带 `Authorization: Bearer {token}`
- 自动刷新访问令牌（access token），在 token 过期时通过后端 `/api/refresh` 接口获取新 token
- 找回/重置密码流程（验证码 + 新密码设置）

### 知识库模块
- 显示公开知识库列表（分页、搜索、筛选）
- 查看知识库详情
- 下载单个知识库文件或整库压缩包（打包文件名：`知识库_{名称}_{作者}_{最后更新时间yyyyMMddHHmmss}.zip`）
- 我的知识库：上传、编辑、删除知识库及文件
- 知识库申请公开（需审核）与状态展示（私有/审核中/已公开/已驳回）
- 知识库审核列表与详情抽屉（管理员/审核员），支持在线预览文件（TOML/JSON/TXT）

### 人设卡模块
- 显示公开人设卡列表（分页、搜索、筛选）
- 查看人设卡详情
- Star/取消 Star 人设卡
- 我的人设卡：上传、编辑、删除人设卡及文件
- 人设卡申请公开（需审核）与状态展示（私有/审核中/已公开/已驳回）
- 人设卡审核列表与详情抽屉（管理员/审核员），支持 TOML 可视化预览与关键字搜索

### 用户中心与个人功能
- 获取当前登录用户信息（`/api/users/me`）
- 在个人中心中查看和修改基础资料、头像与密码
- 在首页右上角「我的数据」抽屉中查看下载/收藏总览与最近30天趋势

### 全局布局与导航
- 左侧整列菜单 + 顶部导航布局
- 可展开/收起的侧边菜单（带过渡动画）
- 顶部展示当前页面标题（与浏览器标签页标题同步）
- 右上角头像菜单（个人中心入口、登出）

### 消息通知与实时状态
- 顶部铃铛入口，展示消息未读数
- 消息缩略列表 + 详情弹窗（支持上一条 / 下一条切换）
- 一键标记所有未读消息为已读
- 基于 WebSocket 的消息实时同步
- 头像右下角在线 / 离线状态指示（基于 WebSocket 连接与心跳）
- 统一的全局通知系统（基于 Element Plus Notification，采用玻璃拟态样式）
- 标准化的 API 错误处理与文案输出（集中于 `src/utils/api.js`）

---

## 🧱 技术栈

- 框架：Vue 3（`<script setup>`）
- 构建工具：Vite
- UI 组件库：Element Plus
- 路由：Vue Router 4
- HTTP 客户端：Axios

依赖声明见 [package.json](./package.json)。

---

## 📁 目录结构（前端）

```bash
MaiMaiNotePad-FrontEnd/
├── public/                  # 静态资源
├── src/
│   ├── api/                 # 与后端交互的 API 封装
│   │   ├── index.js         # Axios 实例与拦截器（含自动刷新 token）
│   │   ├── user.js          # 用户相关接口
│   │   ├── knowledge.js     # 知识库相关接口
│   │   ├── persona.js       # 人设卡相关接口
│   │   ├── messages.js      # 站内消息相关接口
│   │   └── admin.js         # 管理员与审核相关接口
│   ├── assets/              # 静态资源
│   ├── components/          # 通用组件（如评论组件 CommentSection、审核列表 ReviewList 等）
│   ├── composables/         # 复用逻辑（如 useFileViewer 统一处理文件预览/下载）
│   ├── router/
│   │   └── index.js         # 路由配置
│   ├── stores/              # Pinia 状态管理（user / knowledge / persona 等）
│   ├── utils/
│   │   ├── api.js           # 通用 API 响应/错误处理与通知工具
│   │   ├── author.js        # 作者信息展示工具（getAuthorName / getAuthorDisplay）
│   │   └── websocket.js     # WebSocket 管理与心跳
│   ├── views/
│   │   ├── Home.vue                 # 首页 + 消息及在线状态
│   │   ├── Login.vue                # 登录页
│   │   ├── Register.vue             # 注册页
│   │   ├── ResetPassword.vue        # 重置密码
│   │   ├── KnowledgeBase.vue        # 公共知识库列表与详情
│   │   ├── MyKnowledge.vue          # 我的知识库管理
│   │   ├── KnowledgeUpload.vue      # 知识库上传
│   │   ├── KnowledgeReview.vue      # 知识库审核（管理员/审核员）
│   │   ├── favorites/               # 收藏视图（知识库收藏 / 人设卡收藏）
│   │   ├── PersonaCard.vue          # 公共人设卡列表与详情
│   │   ├── MyPersona.vue            # 我的人设卡管理
│   │   ├── PersonaUpload.vue        # 人设卡上传
│   │   ├── PersonaReview.vue        # 人设卡审核（管理员/审核员）
│   │   └── UserCenter.vue           # 用户中心（个人资料与安全设置）
│   ├── App.vue              # 根组件
│   ├── main.js              # 应用入口
│   └── style.css            # 全局样式
├── .env.development         # 开发环境配置
├── .env.production          # 生产环境配置
├── api_documentation.md     # 针对后端 API 的前端使用文档
├── vite.config.js           # Vite 配置（含 /api 代理）
└── README.md                # 本文档
```

---

## 🧑‍💻 开发约定（前端）

为了减少重复代码、保证界面行为一致，新增/修改前端功能时建议遵循以下约定：

- **统一的通知与错误处理**
  - 使用 `src/utils/api.js` 中的：
    - `handleApiError` / `showApiErrorNotification` 处理和展示接口错误
    - `showSuccessNotification` / `showErrorNotification` / `showInfoNotification` 进行统一通知
  - 在业务组件中不要手写重复的错误提示拼接逻辑。

- **统一的时间与文件大小展示**
  - 所有「时间」展示（含日期+时间）使用 `formatDate(value)`。
  - 所有「文件大小」展示使用 `formatFileSize(size)`。
  - 这两个工具函数均定义在 `src/utils/api.js` 中，已经在知识库、人设卡、收藏、审核等模块统一接入。
  - 如需只展示日期（不含时分秒），可以在各自页面定义简单的 `formatDateOnly`，但底层仍应基于 `Date` 对象并与 `formatDate` 风格保持一致。

- **统一的作者信息展示**
  - 获取作者名称请使用 `src/utils/author.js` 中的：
    - `getAuthorName(item)`
    - `getAuthorDisplay(item)`（会拼出「作者: xxx」格式）
  - 知识库、人设卡、收藏、审核等模块已统一接入，新增页面不要再重复定义 `getAuthorName/getAuthorDisplay`。

- **统一的文件预览与下载逻辑**
  - 任何包含「文件列表 + 预览/下载」的页面（例如知识库、人设卡及其收藏/审核视图），都应优先使用 `src/composables/useFileViewer.js` 提供的 `useFileViewer`：
    - 由页面传入 `apiBase`、资源类型文案（如“知识库”“人设卡”）、如何获取当前资源 ID 以及预览/下载路径拼接函数；
    - 页面中只保留业务相关的抽屉/表格结构，把实际的 `fetch` / 权限校验 / 错误处理交给 `useFileViewer`。
  - 避免在各个页面中复制粘贴预览/下载的 `fetch` 实现，便于未来统一扩展（例如支持更多可预览的文件类型、增加下载统计等）。

---

## ⚙️ 环境变量与后端联调

本项目使用 Vite 的环境变量机制：

- 开发环境：`.env.development`
  - `VITE_API_BASE_URL=/api`
  - 通过 Vite 代理，将以 `/api` 开头的请求转发到后端 `http://localhost:9278`
- 生产环境：`.env.production`
  - `VITE_API_BASE_URL=https://your-production-api.com/api`
  - 可根据真实部署地址修改为线上后端域名

Vite 代理配置见 [vite.config.js](./vite.config.js)：

- 将 `/api` 代理到 `http://localhost:9278`
- 同时开启 `server.host = true`，方便局域网其它设备访问前端。

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd MaiMaiNotePad-FrontEnd
npm install
```

### 2. 开发模式启动

确保后端已在 `9278` 端口运行，可以使用一键启动脚本或直接运行 uvicorn：

```bash
cd ../MaiMaiNotePad-BackEnd
./start_backend.sh
# 或
python -m uvicorn main:app --host 0.0.0.0 --port 9278 --reload
```

在前端目录启动开发服务器：

```bash
cd ../MaiMaiNotePad-FrontEnd
npm run dev
```

默认访问地址：

- 本机：`http://localhost:5173/`
- 局域网：根据终端输出的 `Network` 地址，例如 `http://192.168.x.x:5173/`

### 3. 生产构建与预览

打包构建：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

---

## 🔐 鉴权与自动刷新 Token

前端与后端的 JWT 交互约定如下：

- 登录成功后（`POST /api/token`）：
  - 前端从响应中读取 `access_token` 与 `refresh_token`
  - 分别保存到 `localStorage.access_token` 和 `localStorage.refresh_token`
- 后续所有使用 `apiClient` 的请求：
  - 在请求拦截器中，从 `localStorage.access_token` 读取 token 并写入 `Authorization` 头
- 当接口返回 `401 Unauthorized` 时：
  - 如果存在 `refresh_token`，前端自动调用 `POST /api/refresh` 获取新的 `access_token`
  - 刷新成功：
    - 更新本地 `access_token`
    - 自动使用新 token 重新发起原本失败的请求
  - 刷新失败或无 `refresh_token`：
    - 清除本地 token
    - 跳转到登录页 `/login`

具体实现见：

- Axios 实例与拦截器：[src/api/index.js](./src/api/index.js)
- 登录逻辑与 token 持久化：[src/views/Login.vue](./src/views/Login.vue)

---

## 📊 功能完成进度

下面是当前前端功能与后端能力的对齐情况（基于代码与 API 文档的梳理）：

### 认证与用户

- [x] 登录页（用户名/密码）
- [x] 登录成功后保存 `access_token`/`refresh_token`
- [x] 基于 Axios 拦截器自动附带 `Authorization` 头
- [x] 自动刷新访问 token（调用 `/api/refresh`）
- [x] 注册流程完整打通（获取验证码、注册表单校验、错误提示、回跳登录页并自动填充）
- [x] 修改密码、重置密码前端流程

### 知识库模块

- [x] 显示公开知识库列表（分页、搜索、筛选参数已接入）
- [x] 查看知识库详情
- [x] 下载单个文件
- [x] 下载整库压缩包
- [x] 个人上传记录视图与管理操作（删除、编辑等）
- [x] Star/取消 Star 的前端交互与状态同步全面对齐文档
- [x] 知识库公开申请审核列表与详情抽屉（含文件列表与在线预览）
- [x] 收藏知识库视图（收藏列表、详情抽屉及整库下载）

### 人设卡模块

- [x] 显示公开人设卡列表（分页、搜索、筛选）
- [x] 查看人设卡详情
- [x] Star/取消 Star 人设卡
- [x] 下载单个文件
- [x] 下载人设卡压缩包
- [x] 个人人设卡管理视图（我的上传、人设卡审核状态等）
- [x] 人设卡公开申请审核列表与详情抽屉（含文件列表与 TOML 可视化预览）
- [x] 收藏人设卡视图（收藏列表、详情抽屉及压缩包下载）

### 用户中心与管理

- [x] 用户中心基础路由与页面骨架
- [x] 审核面板：知识库/人设卡审核列表与详情抽屉（管理员/审核员）
- [x] 展示后端统计数据（上传数量、收藏统计等）
- [x] 管理员用户管理与统计视图（用户管理、禁言管理、公告发布与运营看板）

### 全局布局与导航

- [x] 左侧整列菜单与 logo 区域
- [x] 可收起 / 展开的侧边菜单（含动画过渡）
- [x] 顶部导航栏展示当前页面标题
- [x] 浏览器标签页标题显示为 `麦麦笔记本 - 当前页名称`

### 消息通知与实时状态

- [x] 消息列表与未读角标展示
- [x] 消息缩略卡片与详情弹窗联动
- [x] 消息「一键已读」操作
- [x] WebSocket 实时同步未读数与最新消息
- [x] 头像在线状态指示（基于 WebSocket 连接与心跳）

---

## 迭代阶段规划（Roadmap）

> 以下为前端视角的阶段性规划，会随着实际开发进展调整。

### 阶段一：当前产品打磨（已完成）

**1.1 用户基础能力完善**

- [x] 用户中心统计视图  
  展示当前用户的上传数量、收藏数量、最近上传时间等基础统计信息。
- [x] 个人中心交互与布局优化  
  包含密码修改、头像管理、基础资料查看等。

**1.2 审核与管理基础能力**

- [x] 审核面板入口与导航优化  
  在用户中心或侧边菜单中提供更清晰的审核入口和状态入口（待审核、已审核）。
- [x] 管理员用户管理视图  
  用户列表、搜索、分页视图，支持修改角色、禁用/删除用户等基础操作。
- [x] 管理员基础运营看板  
  提供上传趋势、审核通过率、活跃用户等基础统计信息展示。

### 阶段二：体验与技术优化（进行中）

**2.1 文件与内容浏览体验**

- [ ] 文件浏览体验升级  
  TOML 可视化面板中高亮搜索命中的块/键/值/注释，支持块内二次过滤。

**2.2 列表与交互性能**

- [ ] 列表性能与交互优化  
  为公开列表和审核列表增加搜索/筛选的请求防抖，必要时引入虚拟滚动；配合后端索引优化，减少高并发场景下的查询压力。

**2.3 可观测性与审计**

- [ ] 日志与审计信息完善  
  与后端配合，对关键操作（登录、上传、删除、审核、角色变更等）增加可追踪的审计记录，在前端对错误信息做更精细化展示。

### 阶段三：产品玩法拓展（规划中）

**3.1 人设编辑与模板**

- [ ] 人设卡结构化编辑器与模板系统  
  提供基于块结构的人设编辑器，支持按块编辑内在/personality、表达/expression 等，并支持从模板一键创建人设卡。

**3.2 关联推荐与协同展示**

- [ ] 知识库与人设卡联动展示  
  在人设卡详情中展示推荐搭配的知识库，在知识库详情中展示使用该知识库的人设卡，实现双向关联。

**3.3 互动与反馈机制**

- [ ] 评分与反馈机制  
  在 Star 之外增加评分/评论与简单投诉入口，为后续审核和推荐提供更多信号。

### 阶段四：质量与运营能力（规划中）

**4.1 质量保障体系**

- [ ] 自动化测试体系  
  为核心流程（登录、上传、审核、下载等）补充端到端测试和部分组件级单元测试，保障回归质量。

**4.2 管理与监控能力**

- [x] 管理员统计与看板  
  为管理员提供基础运营看板，例如上传趋势、审核通过率、活跃用户数等。
- [ ] 监控与告警对接预留  
  在前端错误上报和后端日志基础上预留与监控/告警系统对接的能力，便于未来托管和多实例部署。

---

## 开发说明

- 使用 Vue 3 `<script setup>` 风格组件
- 路由按模块拆分视图（登录、注册、知识库、人设卡、用户中心等）
- 所有与后端交互的请求统一通过 `src/api` 下的封装发起，避免在视图中直接拼接 URL
- 常见 API 响应和错误统一通过 `src/utils/api.js` 中的工具函数处理，确保提示文案一致

### 角色与管理入口说明

- 普通用户（`user`）：只能访问「广场」「我的」「收藏」等个人相关页面
- 审核员（`moderator`）：可以访问审核相关页面，用于审核知识库和人设卡
- 管理员（`admin`）：拥有审核、禁言/解禁、封禁/解封、公告发送等管理权限
- 超级管理员（`super_admin`）：在前端视图上等同于「拥有全部管理员权限」，并且在后端可以对管理员账号执行禁言/封禁等敏感操作
- 左侧「管理」菜单会在当前用户具备管理员权限时展示（后端通过 `is_admin` / `is_super_admin` 字段返回）

后续如果扩展新模块（例如后台管理页），建议：

- 在 `src/views/` 下新增对应页面
- 在 `src/api/` 下增加该模块的 API 包装
- 在 `src/router/index.js` 中补充路由并控制访问权限（如仅管理员可见，包含 `admin` / `super_admin`）

---

## 常见问题

### 无法登录或提示 401

- 确认后端已在 `9278` 端口正常运行，并可访问 `http://localhost:9278/docs`
- 确认环境变量 `VITE_API_BASE_URL` 配置正确（开发环境建议为 `/api`）
- 如果多次 401 后被跳转回 `/login`，说明刷新 token 也失败了，需要重新登录

### 下载文件失败

- 检查浏览器控制台 Network 面板查看具体接口返回
- 确认登录状态是否有效（过期会触发刷新流程）
- 确认后端对应下载接口已按照文档实现，并且当前用户有权限访问目标资源
