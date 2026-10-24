# ADR 0005：示例、页面和下载的唯一源码

- 状态：W3 已采纳。
- 日期：2026-10-24（America/New_York）。

## 决策

`examples/registry.json` 登记网站自有示例；`metadata/pages.json` 登记中英文页面、发布状态、基线和来源。唯一可编辑起步包位于 `examples/course/00-starter/`。不从生成页面、ZIP 或本地游戏目录重建此源码。

第一份起步包使用 Manifest v5 / Scene ABI v2，显式声明四条 `builtin` Terrain 路由及各自的声明性 SceneDraw 命令。包自有 `frameTarget` 使用一张 viewport RGBA8 颜色纹理和一张 depth24 纹理；present Program 采样颜色并输出。它属于 External Complete 作者路径，不能当作零额外资源的 BuiltIn Minimal。W3 仅完成 GL-free 验证，真实加载、颜色、画面及生命周期留到 W4。

生成器从精确文件字节产生代码片段、双语示例页、源码清单、原始文件下载及确定性 ZIP。普通构建仅消费公开源码和已提交的 Analyzer 收据，验证收据与当前输入完全匹配；不使用私有 token，不读取宿主目录，也不声称每次 Linux 构建都重新运行 Windows Analyzer。

## 验证和身份

固定的自包含 Analyzer 在仓库外临时工作目录分别检查源码与新解压 ZIP：`pack validate`、`scene explain`、`graph dump`、`program interface`。检查退出码、诊断、四条活动 fallback、资源/命令数量和源码合同；比较文件清单、canonical manifest hash 与归一化输出。保留原始 stdout/stderr 于本地 `artifacts/w3/`，公开收据只记录必要身份、输出指纹与明确证据边界。

原始指南仍走 `validate-upstream.mjs`，课程走独立 registry 流程；`authoring:check` 串联两者。原始 v5 的 `DLTOOL2001` 失败及网站专用变体的通过分别保留，不把课程示例当作修复原文的证据。

下载路径包含基线和完整源码指纹。`metadata/example-releases.json` 固定已发布源文件与压缩包身份；已发布章节继续登记并保留下载，修订必须登记新版本。生成器仅管理明确的输出目录，不能写入 `examples/` 或手工页面。源文件使用 UTF-8 LF，ZIP 路径排序、时间戳和其他元数据固定。

## 构建与发布

公开 PR/main CI 执行生成器回归、输入收据匹配、双语元数据、构建和浏览器检查，再部署同一产物。Windows 手动工具链工作流同时复验原始指南和课程 ZIP；其私有资产 secret 仍需维护者配置。该工作流未运行时，普通 CI 报告明确表示使用匹配的既有 Analyzer 收据。

下载链接使用原生 `download` 属性，避免客户端路由接管 JSON、README 或着色器文件；`public/**` 不进入 Markdown 页面发现。Pages 仅包含登记的下载产物，完整上游快照、工具、原始日志和私有源码仍被排除。
