# W3：示例与内容生成基础验收

- 日期：2026-10-24（America/New_York）。
- 宿主基线：`candidate-f8aaa5c4` / `f8aaa5c4218f54536ccf994a2d512aed2e3678b7`。
- 结论：W3 静态工程完成；不构成 W4 游戏运行验收。
- 机器可读记录：`metadata/w3-verification.json`。

## 已交付

1. `examples/registry.json` 登记第一个网站自有示例 `course/00-starter`，显式记录文件、来源、版本、Program、默认分支、公共能力和 snippet。
2. `metadata/pages.json` 为八组可阅读双语页面及双语 404 登记发布状态、基线和来源；实际 frontmatter 必须匹配登记。
3. Manifest v5 / Scene ABI v2 外置起步包：四类 Terrain 均使用显式 SceneDraw 声明和各自的 `builtin` fallback；两张 persistent viewport 纹理组成 `frameTarget`，一个包自有 present Program 完成颜色输出。
4. 生成 13 个派生文件：四个双语页面、ZIP、四个原始源码下载、源码/片段清单、公开收据、下载索引和生成清单。生成器不覆盖唯一源码。
5. 固定 Analyzer 调用封装、原始日志与结构化失败报告；原始指南流程和新课程流程分别保留，通过 `authoring:check` 串联。
6. 已发布示例身份锁定；不可原位替换已发布 ZIP，修订需登记新 ID 并保留旧章节。

## 同源和确定性证据

| 身份 | 值 |
| --- | --- |
| 源码指纹 | `a85731589fbb852352a486c378d51cb49a6b27e38a749aaf16a199bf98ba12be` |
| ZIP SHA-256 | `432356b77d9247a98a764064b5cc7a290d033ad609064b4edaedf62d63bbe034` |
| ZIP 长度 | 3,631 字节 |
| Loader canonical manifest hash | `0d8eba466b9ffe10becffce08ec51906369bc11fb4d9c9d1b04c564068a75262` |
| 工具资产 | `docs-tools-f8aaa5c4-w1.1` |
| 工具清单 SHA-256 | `548c685ff8ccc23283cd6b803a595cc2fed35b2df1444dc0327e1baf847ffb54` |

源码目录与新解压 ZIP 各执行四条命令，共 8 次真实 Analyzer 调用：Loader、Scene explain、graph dump 和 present Program interface。结果无诊断，四条 fallback 全部活动，资源与命令闭包符合登记；对应输出归一化 SHA-256 和 manifest hash 一致。ZIP 根目录直接包含 `shaderpack.json`，不依赖上一章。全文/JSON Pointer 片段来自相同文件字节，并记录来源和片段哈希。

同一公开输入重复生成，文件清单及 ZIP 哈希一致。生成器回归还证明生成不修改源码、下载解压内容不容篡改。源文件的 LF 规则与固定 Node 版本保障跨平台重建身份一致。

## 检查结果

| 检查 | 结果 |
| --- | --- |
| 内容生成回归 | 19/19，通过重复 ID、错误基线/commit、路径越界、失效 snippet/JSON Pointer、缺失/额外文件、重复区域、过期收据、不可变发布、ZIP 篡改/CRC/重复路径与命令退出码检查 |
| 既有锁定输入回归 | 6/6，含 Windows `core.autocrlf=true` checkout 与 ZIP 二进制/混合换行往返 |
| 原始上游验证 | 18 项普通成功、1 项既知原始 v5 `DLTOOL2001` 失败得到确认；v4 指南和网站 v5 变体分别通过 |
| 页面/来源校验 | 18 个页面登记和 frontmatter 匹配，来源与基线一致 |
| 静态构建 | 18 HTML、410 个本地链接、209 项资源引用、99 个章节锚点通过 |
| 本地浏览器验收 | 桌面/移动端共 46/46，通过真实 ZIP 下载和 SHA-256、四个源码下载、双语搜索、章节切换、复制与窄屏检查 |
| 视觉复核 | 桌面/手机英文示例页和已有首页截图已检查 |
| 依赖审计 | 增加固定 `yaml@2.9.1` 后，npm 审计为零漏洞 |

公开 CI 从干净 checkout 重新执行生成器回归、收据匹配、构建和浏览器检查。完整 Windows Analyzer 工具链仍使用私有锁定资产，手动工作流已接入，但 `DAWNLIGHT_ASSETS_TOKEN` 未配置；不能把公开 Linux CI 的收据匹配称为一次新的 Analyzer 执行。原始 stdout/stderr 和截图在忽略 Git 的 `artifacts/w3/`。

## 实际范围与后续

本起步包分配两张纹理，不是 BuiltIn Minimal 的零扩展资源 descriptor。W3 没有可开关效果，因此只验证默认分支；后续条件分支需扩充显式矩阵与验证器。

`driverStatus=notProvided`、`runtimeEvaluated=false`、`liveWorldVerified=false`、`visual=notRun`。尚未在游戏中验证天空、模型、各 Terrain 类别、粒子、色彩、UI、重载、resize、device reset 或返回 BuiltIn。W4 继续完成实际加载和前五章课程；没有运行截图，也没有性能或正式发布成功声明。

当前自定义域名与 HTTPS 配置按用户要求保持；W0/W1/W2 冻结文件及其 SHA-256 不改写，完整快照和工具不进入公开 Git 或 Pages。
