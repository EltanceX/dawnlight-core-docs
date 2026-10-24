# W2：网站骨架与首轮部署验收

- 日期：2026-10-23（America/New_York）。
- 状态：本地构建与浏览器验收通过，首次公开部署验收进行中。
- 宿主基线：`candidate-f8aaa5c4` / `f8aaa5c4218f54536ccf994a2d512aed2e3678b7`。
- 决策：[公开网站与首轮部署](../adr/0003-public-site-deployment.md)。

## 产物与发布范围

公开仓库：<https://github.com/EltanceX/dawnlight-core-docs>；Pages：<https://eltancex.github.io/dawnlight-core-docs/>。上游公开来源：<https://gitea.com/EltanceX/DawnlightCore>，已匿名核对 commit 和一份指南的原始字节。

首轮提供六个可阅读页面：首页、阅读路线、从配置到一帧画面、资源与 drawBuffers、Analyzer、当前基线，以及 404。导航只指向已完成页面。首批内容解释作者合同和证据范围，完整起步包与连续教程仍属于 W3/W4。

完整 W1 快照 438 个文件继续保存在本地及原有私有 Release；公开 Git 排除 `vendor/`、`.cache/`、`artifacts/`、依赖目录、工具与归档。公开下载 `site-baseline.json` 只投影选择的基线、合同及验证摘要。

## 本地验收

| 检查 | 结果 |
| --- | --- |
| 固定依赖安装 | Node 24.22.1 / npm 11.19.0，lockfile 安装成功 |
| npm audit | 当前依赖树零漏洞；不是未来安全保证 |
| 静态站点 | 7 个 HTML，110 条内部链接、62 处资产引用、35 个锚点通过 |
| 浏览器 | Edge Chromium 无头，1440×1000 与 390×844，12 项通过 |
| 搜索 | `资源`、`drawBuffers`、`DLTOOL2001` 在双视口召回目标页面 |
| 页面操作 | 深层直达/刷新、无横向溢出、移动菜单、深色主题、复制、下载、404 返回通过 |
| 视觉复核 | 已查看桌面与移动端首页、内容页截图，检查正文、代码、表格与布局 |

原始构建清单、浏览器 JSON 与截图、npm audit 保存在本地 `artifacts/w2/`，不提交公开 Git。机器可读验收摘要将在公开部署验证后写入 `metadata/w2-verification.json`。

## 证据边界

普通网站 CI 不读取完整快照、不访问本地宿主、不需要私有资产 token。手动完整工具链工作流的 `DAWNLIGHT_ASSETS_TOKEN` 尚未配置，不能声称 Analyzer 已在该公开仓库 CI 中复验。

W0/W1 冻结记录和哈希保持原样。原始 v5 指南的 `DLTOOL2001` 仍是已确认失败，独立网站变体通过。`driverStatus=notProvided`、`mappingStatus=deferred`、`runtimeEvaluated=false`、`liveWorldVerified=false` 均保留；网站构建与部署不提升游戏、画面或性能证据等级。
