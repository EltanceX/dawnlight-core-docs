# 中英文页面维护

中文使用原有根路径，英文使用 `/en/`。当前 20 组内容页面与双语 404 均已配对，共 42 页。VitePress 顶栏语言菜单在桌面与手机上可见，切换到对应页面并保留 hash；首页品牌链接、导航、侧边栏、页尾、搜索提示、基线与来源组件使用当前语言。

## 新增和更新内容

1. 在 `metadata/pages.json` 登记配对路径、发布状态、基线和来源；同步手工页面的 `dawnlight` frontmatter。生成的示例页在 registry 和生成模板中维护，不能直接编辑生成文件。`scripts/lib/site-pages.mjs` 自动读取登记路径。
2. 为对应标题使用相同的显式章节 ID，例如 `## 支持边界 {#support-boundaries}` 与 `## Support boundaries {#support-boundaries}`。既有中文标题 ID 以不可见的 `legacy-anchor` 保留在两种语言中，保障旧链接及其语言切换。
3. 翻译解释和代码组标签，保留字段、token、版本、Program ID、JSON 及命令正文。`docs:check` 会比较两种语言的 JSON/PowerShell 代码块、章节 ID 及原生示例 include 列表。实机组件使用同一记录的对应语言说明。
4. 站内链接使用同语言的相对路径，公共下载使用 `/downloads/`。来源链接继续指向公开 Gitea 的精确宿主 commit。
5. 修改导航与界面文案时同步 `site/.vitepress/config.ts`。首页、基线与来源组件按当前语言响应切换，不能只翻译 Markdown 而遗漏公共组件。

## 检查与发布

`npm run docs:build` 检查页面配对、技术示例、章节、语言标记、静态链接及资产。中英文使用独立的本地搜索索引；中文保留双字切分，英文保留字段和诊断码。

`npm run test:site` 共 60 项桌面/移动端检查：双语基础页面、全部课程、页面与章节切换、原生代码复制、五个 ZIP 及全部原始源码哈希、公开证据、MRT/oct 搜索和窄屏显示。平板的顶栏导航折叠为菜单，语言入口继续直接显示。既有截图在本地 `artifacts/w2/`、`artifacts/w3/`，课程截图在 `artifacts/w4/`，需复核英文长标题、表格、深色主题和手机排版。

提交 `main` 后沿用既有 Actions 构建与 Pages 部署；使用 `SITE_URL=https://core.eltancex.top/` 对已部署网站执行同一套测试。W2 首次部署验收保留历史内容；增加翻译或迁移域名不改变宿主基线、W1/W2 冻结指纹或实机证据。
