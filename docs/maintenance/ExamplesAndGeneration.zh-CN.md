# 示例与内容生成维护

当前有 `course/00-starter` 至 `course/04-mrt` 五个完整快照。中英文示例页、代码片段、源码下载和 ZIP 均由各自 `examples/course/` 源码生成。静态收据保持独立范围；W4 的有限实机观察见 `metadata/w4-runtime.json` 和[维护方法](RuntimeCourse.zh-CN.md)。

## 文件职责

| 路径 | 职责 |
| --- | --- |
| `examples/registry.json` | ID、源码根、文件白名单、入口、版本、Program、默认分支、snippet 与来源 |
| `metadata/pages.json` | 页面、语言配对、发布状态、基线、来源与生成归属 |
| `metadata/examples-validation.json` | 固定 Analyzer 对当前源码及新解压 ZIP 的确定性收据 |
| `metadata/example-releases.json` | 已发布源码指纹与 ZIP 身份，阻止原位替换 |
| `site/examples/`、`site/en/examples/` | 生成的双语页面，不手工编辑 |
| `site/public/downloads/examples/` | 按基线/示例/源码指纹组织的 ZIP、原始文件和公开收据 |
| `site/.vitepress/generated/output-manifest.json` | 确定性生成文件清单 |
| `metadata/w4-runtime.json` | 带日期的实机观察、源码身份和公开证据文件清单 |
| `artifacts/w3/`、`artifacts/w4/` | 原始检查输出、浏览器截图及本地报告，不自动发布 |

生成目录均忽略 Git，由公开输入重建。生成页关闭默认的 GitHub 编辑链接，避免链接到未入库的派生文件；请修改登记源码或生成模板。示例文本固定为 UTF-8 LF；`.gitattributes` 保障 Windows 和 Linux 的源码及下载哈希一致。

## 新增示例

1. 在 `examples/course/<revision>/` 建立完整独立源码；登记唯一 ID、文件白名单、Manifest 与 ABI、Program、公共能力和来源。
2. 登记需要展示的完整文件、JSON Pointer 或 GLSL 命名区域。严格 JSON 不添加注释；GLSL 区域使用唯一的 `// #region name` / `// #endregion name`。
3. 为两个语言登记对应页面和相同章节 ID，增加必要解释。生成模板保留 00 起步包的既有页面，并为后续快照展示全部文件。手写教程用 `<<< @/../examples/course/...` 引入已登记的完整文件，两个语言的引入列表必须一致；路径校验拒绝私有目录、区域片段和未登记输入。新增能力仍需扩充适用验证逻辑。
4. 用固定 Analyzer 运行 `npm run examples:check`。此命令对源码和刚解压的 ZIP 都进行校验；只有全部通过才写入新的公开收据。
5. 运行生成、回归和浏览器检查，审查最终网页及源码/ZIP 清单。
6. 首次发布时把新示例的源码指纹、ZIP SHA-256 和长度登记在 `metadata/example-releases.json`。既有发布项不删除、不改写；修订使用新 ID 和源码目录。

W3 起步包没有可开关效果，registry 明确只登记 `default`，所有四条 Terrain 路由活动。新增 options/capability 分支时，必须先扩充 Analyzer 封装和闭包预期，再登记每个分支；当前脚本拒绝未支持的分支。

## 命令

```sh
npm run docs:generate
npm run docs:check
npm run test:content
npm run docs:build
npm run test:site
```

以上命令只需要公开 checkout、固定 Node/npm 与 npm 依赖。生成前验证收据是否仍与源码、registry、基线和工具身份匹配。`docs:check` 不改写生成文件；检测到改动会说明具体文件。

具有固定 Windows x64 工具资产的维护者还可以运行：

```sh
npm run examples:check
npm run examples:package
npm run authoring:check
```

`examples:check` 更新通过验证的收据；`examples:package` 重新验证既有收据、解压校验和生成；`authoring:check` 串联原始指南/Schema 与课程流程。完整工具链的获取方式见[锁定输入](LockedInputs.zh-CN.md)。

Analyzer 退出码 1 是业务合同失败，2 是命令用法错误，二者分别记录。当前失败详情位于 `artifacts/w4/validation/failure.json` 及各示例下的 `.result.json`、stdout/stderr 文件。报告标出示例 ID、文件或 JSON Pointer；不要通过修改预期状态掩盖真实失败。

## 公开 CI 与运行时边界

公开 Linux CI 校验匹配的既有 Analyzer 收据、重新生成 ZIP，并执行 43 项内容回归和 72 项桌面/移动端浏览器检查。构建另校验公开驱动、接口、生命周期及图片哈希。它不重新执行 Windows Analyzer 或游戏。手动 Windows 工作流已接入课程与 W5 参考的 Analyzer 流程，仍需要 `DAWNLIGHT_ASSETS_TOKEN` 读取私有固定工具与快照；当前未配置此 secret。W5 参考的独立生成和预期拒绝维护见 [Reference.zh-CN.md](Reference.zh-CN.md)。

静态收据中的 `driverStatus=notProvided`、`runtimeEvaluated=false`、`liveWorldVerified=false`、`visual=notRun` 原样保留；课程用单独组件显示有日期、宿主和快照身份的实机观察。没有覆盖的类别、device reset、其他平台、性能和独立真人试读仍待完成。源码哈希匹配和静态检查通过不能替代实际运行记录。
