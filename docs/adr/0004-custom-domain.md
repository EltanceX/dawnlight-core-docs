# ADR 0004：自定义域名与根路径部署

- 状态：已采纳。
- 日期：2026-10-23（America/New_York）。

## 决策

根据用户配置的域名，将当前网站地址改为 <https://core.eltancex.top/>，base 改为 `/`。中文位于根路径，英文位于 `/en/`，继续在顶栏切换对应页面与章节。GitHub 仓库、编辑链接、工作流和上游来源地址不变。

`upstream.lock.json.website` 的 `pagesUrl`、`pagesBase` 和 `customDomain` 表示当前配置，VitePress 与构建检查共同读取。`site/public/CNAME` 声明同一域名并随静态产物发布；使用 Actions 部署时，GitHub Pages 的 Custom domain 设置仍需在服务端配置，不能仅靠 CNAME 文件生效。

可读页面输出使用 HTTPS 自定义域名的 canonical、双语 alternate 和 `og:url`，直接加载及站内切换均保持当前页面地址。站点地图采用同一地址，404 页面从站点地图排除；不存在的地址继续返回真实 HTTP 404。资源、搜索、下载和语言切换都使用根路径。

## 历史与验证

ADR 0003、W2 首次部署记录、`plannedPagesUrl` 与 `firstVerifiedDeployment` 继续记录原始项目 Pages 地址；不改写冻结验收文件、哈希或上游基线。域名切换不增加游戏运行证据。

构建检查核对 CNAME、域名、双语 canonical/alternate、根路径资源与锚点；沿用 38 项桌面/移动端浏览器检查，并以 `SITE_URL=https://core.eltancex.top/` 复验线上页面、深层链接、语言切换、搜索、下载和双语 404。

## DNS 与 HTTPS 运维

当前公开 DNS 使用 Cloudflare 代理，HTTPS 入口可以访问。迁移时 GitHub Pages 报告 `https_enforced=false`，请求开启强制 HTTPS 返回 `The certificate does not exist yet`。这表示 Cloudflare 入口 HTTPS 与 GitHub Pages 源站证书是分别管理的；不能把入口 HTTPS 可用记为源站证书已签发或 HTTP 已强制跳转。

维护者可在 Cloudflare 为此域名配置 HTTP → HTTPS 重定向。若需要 GitHub Pages 自身强制 HTTPS，应先确认 DNS 指向 `EltanceX.github.io`，必要时暂时改为仅 DNS，让 GitHub 验证并签发证书，再开启 Pages 的 Enforce HTTPS。源站支持后使用 Cloudflare Full (strict)。验收时分别检查 HTTPS 页面、HTTP 响应和 Pages `https_enforced` 状态。
