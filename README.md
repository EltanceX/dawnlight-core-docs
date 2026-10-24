# DawnlightCore 作者文档站

本工程按 [网站实现方案](docs/WebsiteImplementationPlan.zh-CN.md) 建设，使用 VitePress 维护中文作者文档。W2 提供首页、阅读路线、管线概念、资源与目标、Analyzer、版本范围六个可阅读页面。

- 网站：[DawnlightCore 作者文档](https://eltancex.github.io/dawnlight-core-docs/)。
- 公开上游：[EltanceX/DawnlightCore（Gitea）](https://gitea.com/EltanceX/DawnlightCore)。
- 网站源码：[EltanceX/dawnlight-core-docs](https://github.com/EltanceX/dawnlight-core-docs)。

当前锁定宿主 `f8aaa5c4218f54536ccf994a2d512aed2e3678b7`，主教程采用 Manifest v5 / Scene ABI v2，兼容资料保留 v3/v4。输入与工具身份见 [upstream.lock.json](upstream.lock.json)。

## 本地开发与构建

使用 `.node-version` 指定的 Node **24.22.1** 和 npm **11.19.0**。普通网站构建只需要此公开仓库，不读取本地宿主目录，不下载私有快照或 Analyzer。

```sh
npm ci
npm run docs:dev
npm run docs:build
npm run docs:preview
```

`docs:build` 检查基线投影、页面来源元数据、公开资源和 Git 文件边界，构建后检查项目 base、链接、锚点及静态资产。预览地址使用 `/dawnlight-core-docs/`，与部署路径一致。

浏览器验收覆盖 1440px 桌面和 390px 移动端、中文/标识符/诊断码搜索、导航、主题、代码复制、基线下载及 404：

```sh
npx playwright install --with-deps chromium --only-shell
npm run test:site
```

Windows 已安装 Edge 时可在 PowerShell 中使用 `$env:PLAYWRIGHT_CHANNEL='msedge'`；配置 `SITE_URL=https://eltancex.github.io/dawnlight-core-docs/` 后，同一套测试会直接验收线上网站。

## 发布与维护

PR 执行公开构建与浏览器检查；`main` 执行同样检查后，通过 GitHub Actions 将同一份产物部署到 Pages。检查不需要私有资产凭据。部署失败时，上一份已成功发布的站点继续服务；回退页面可 revert 对应提交并等待部署成功。

VitePress 1.6.4、Vue 3.5.44 和 Playwright 1.64.1 均固定版本。Vite 6.4.5 与 esbuild 0.25.12 通过 overrides 固定，原因和兼容验证见 [W2 发布决策](docs/adr/0003-public-site-deployment.md)。更新版本时同时审查 lockfile、`npm audit` 和浏览器验收。

## 完整上游工具链

公开仓库排除 `vendor/`、`.cache/`、`artifacts/` 和工具二进制。完整 W1 快照继续保存在本地及已锁定的私有 Release。以下操作仅供具有资产读取权限的 Windows x64 维护者：

```powershell
# 在新 checkout 先恢复快照和工具，需要 gh 与私有资产读取权限。
node scripts/restore-upstream.mjs
node scripts/acquire-tool.mjs
node scripts/verify-upstream.mjs

# 在外部工作目录核对 Schema、指南、示例和公开合同。
node scripts/validate-upstream.mjs

# 验证篡改拒绝、换行保留和错误基线拒绝。
node --test scripts/tests/locked-inputs.test.mjs
```

运行 Analyzer 无需安装 .NET SDK；维护者重新构建工具时需要 .NET 10 SDK。

完整操作、CI 凭据配置和升级流程见 [锁定输入与工具链维护](docs/maintenance/LockedInputs.zh-CN.md)，结果见 [W1 验收记录](docs/baseline/W1ToolchainAudit.zh-CN.md) 与 [W2 验收记录](docs/baseline/W2WebsiteAudit.zh-CN.md)。手动的完整工具链工作流尚未配置 `DAWNLIGHT_ASSETS_TOKEN`，不影响公开网站构建。这些检查提供静态与离线语义证据，游戏画面与驱动验证另行记录。
