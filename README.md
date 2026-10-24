# DawnlightCore 作者文档站

本工程按 [网站实现方案](docs/WebsiteImplementationPlan.zh-CN.md) 建设，使用 VitePress 维护中英文作者文档。当前 20 组内容页面覆盖环境与 GLSL 入门、00～04 连续课程、概念、工具、版本、五份独立快照及实机记录，可在桌面和手机顶栏切换。

- 网站：[DawnlightCore 作者文档](https://core.eltancex.top/)。
- English：[DawnlightCore author documentation](https://core.eltancex.top/en/)。
- 示例：[外置起步包、源码与下载](https://core.eltancex.top/examples/course-starter)。
- 课程：[从加载起步包到 Terrain / MRT](https://core.eltancex.top/tutorial/00-starter)。
- 实机范围：[宿主、报告、画面与复现](https://core.eltancex.top/tutorial/runtime)。
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

`docs:build` 先从公开示例源码和匹配的 Analyzer 收据生成双语示例页、源码清单与 ZIP，再检查页面登记、frontmatter、基线投影、公开资源和 Git 文件边界，构建后检查域名、根路径、双语 canonical/alternate、链接、锚点及静态资产。预览地址使用根路径 `/`，与自定义域名部署路径一致。

浏览器验收覆盖 1440px 桌面和 390px 移动端、中英文搜索、逐页与章节语言切换、导航、主题、代码复制、基线下载及双语 404，并检查 320px 窄屏顶栏：

```sh
npx playwright install --with-deps chromium --only-shell
npm run test:content
npm run test:site
```

Windows 已安装 Edge 时可在 PowerShell 中使用 `$env:PLAYWRIGHT_CHANNEL='msedge'`；配置 `SITE_URL=https://core.eltancex.top/` 后，同一套测试会直接验收线上网站。

## 发布与维护

中文保留根路径，英文位于 `/en/`；语言切换保留对应页面与章节。新增公开页面需在 `metadata/pages.json` 登记双语配对、来源和基线，`scripts/lib/site-pages.mjs` 从登记读取路由。共用章节 ID，保留旧中文锚点；JSON 与命令示例须在翻译间保持一致。维护约定见 [双语页面维护](docs/maintenance/Locales.zh-CN.md)。

PR 执行公开构建与浏览器检查；`main` 执行同样检查后，通过 GitHub Actions 将同一份产物部署到 Pages。检查不需要私有资产凭据。部署失败时，上一份已成功发布的站点继续服务；回退页面可 revert 对应提交并等待部署成功。

五个章节快照的唯一源码为 `examples/course/00-starter/` 至 `04-mrt/`，`examples/registry.json` 登记片段与文件白名单。网页代码、ZIP 和 Analyzer 输入使用同一份精确文件字节；下载地址包含基线和源码指纹，已发布身份锁定在 `metadata/example-releases.json`。W3 起步包字节和历史收据保持不变；W4 另记同源快照的有限实机观察。

`npm run docs:generate` 只生成派生内容；`npm run examples:check` 使用固定 Windows Analyzer 验证源码及新解压 ZIP；`npm run examples:package` 复验收据并生成下载；`npm run authoring:check` 串联原始指南与课程检查。公开 Linux CI 使用与输入匹配的已提交收据，不重新执行 Windows Analyzer。详见[示例与内容生成维护](docs/maintenance/ExamplesAndGeneration.zh-CN.md)。

W4 在用户更正的 DawnlightCore 构建副本上完成五包加载、同包重载、窗口尺寸变化、返回 BuiltIn、驱动与包接口匹配，并从新目录重走第一个效果。`metadata/w4-runtime.json` 绑定源码、驱动报告、生命周期与真实窗口截图；构建会检查证据文件长度、哈希和身份关联。仅覆盖一台 Windows / NVIDIA 设备、一个创意世界，独立真人试读、device reset、其他平台与性能仍待验证。见 [W4 验收](docs/baseline/W4CourseAudit.zh-CN.md) 和[实机观察维护](docs/maintenance/RuntimeCourse.zh-CN.md)。

当前域名为 `core.eltancex.top`，地址与 base 集中维护在 `upstream.lock.json.website`，`site/public/CNAME` 随产物保留域名声明。域名迁移与 HTTPS 运维见 [自定义域名决策](docs/adr/0004-custom-domain.md)。

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
