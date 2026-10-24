# ADR 0003：公开网站与首轮部署

- 状态：W2 已采纳。
- 日期：2026-10-23（America/New_York）。
- 验收：[W2 记录](../baseline/W2WebsiteAudit.zh-CN.md)。

## 决策

网站仓库采用公开的 `EltanceX/dawnlight-core-docs`，默认分支为 `main`，GitHub Pages base 为 `/dawnlight-core-docs/`。用户明确选择仅发布网站工程与公开文档；完整上游快照留在本地和私有资产中。此决策补充 ADR 0001 的 W0 规划，历史记录保留原状。

公开仓库包含 `site/`、维护脚本、来源摘要、阶段记录和依赖锁。`vendor/`、缓存、原始验收输出、上游工具二进制与归档均排除。网站只消费经过选择的公开基线投影，不导入宿主源码或完整快照。导入策略、哈希和恢复脚本保留，供授权维护者复验 W1。

公开上游使用用户提供的 <https://gitea.com/EltanceX/DawnlightCore>，来源链接固定到 `f8aaa5c4218f54536ccf994a2d512aed2e3678b7`。匿名 API 与示例原始文件字节已核对，见 `metadata/public-source.json`。这不改变私有 GitHub 资产的访问权限，也不改写 W0/W1 的来源身份。

## 实现

固定 Node 24.22.1、npm 11.19.0、VitePress 1.6.4、Vue 3.5.44、Playwright 1.64.1，并提交 npm lockfile。默认 VitePress 依赖树审计发现三项问题；固定 Vite 6.4.5 与 esbuild 0.25.12 后，当前审计为零漏洞。Vite 6 满足当前 `@vitejs/plugin-vue` 的 peer 范围；以实际构建和双视口浏览器验收验证兼容。后续升级仍需重跑审计和验收。

沿用 VitePress 的导航、代码高亮、复制按钮、主题切换及本地搜索。搜索保留英文标识符并增加中文双字切分。首批六页提供完整可读内容，后续教程不以空白页面进入导航。JSON 片段明确标注范围；公开下载仅为基线元数据，不能当作完整光影包。

公开 PR 和 `main` CI 均从干净 checkout 执行 `npm ci`、静态构建和 Playwright。`main` 检查通过后上传 Pages 产物，独立部署 job 使用 Pages/OIDC 最小权限发布同一份产物。普通构建无需私有 token。完整 Analyzer 检查保留为独立手动 Windows 工作流；所需的私有资产 secret 尚未配置。

## 验收与后续

浏览器检查覆盖桌面、移动端、深层直达与刷新、三类搜索、菜单、深色主题、代码复制、公开下载及 404 返回。另核对线上 HTTP 状态、静态资产和基线数据。部署记录及新 checkout 验证见 W2 验收，不将网站可访问解释为游戏运行、驱动或性能通过。

回退站点时 revert 有问题的提交并经同一工作流重新部署。W3 才建立完整教学示例、下载包和内容生成，不在 W2 把概念片段声明为可运行教程。
