# JSON 与 ABI 参考维护

W5 增加 18 组双语参考，由手写行为说明和固定公开合同共同生成。普通 Linux 构建只读取公开仓库，不要求完整 vendor、Windows 工具或游戏。

| 输入 / 输出 | 职责 |
| --- | --- |
| `reference/inputs/` | v3/v4/v5 Schema、两版 completion、Catalog、诊断、temporal、UI 指南的精确字节 |
| `metadata/reference-inputs.json` | 每个输入的 commit、原始路径、长度、SHA-256 与公开来源 |
| `reference/groups.json` | Schema 定义的唯一页面归属 |
| `reference/settings-ui-fields.json` | 七类 UI Loader 属性白名单的复核投影；不是官方 UI Schema |
| `reference/pages.json` | 顺序、双语标题/描述、完整示例关联 |
| `reference/prose/{zh,en}/` | 手写默认行为、组合、版本门、单位/空间、证据边界 |
| `metadata/reference-examples.json` | 四份上游完整示例与一份网站反例的文件清单、状态、Analyzer 输出哈希 |
| `reference/examples/uniform-buffer/` | UBO/materialTable 的完整负向配置与 GLSL |
| `site/{en/,}reference/` | 忽略 Git 的生成页面，不能直接修改 |
| `site/public/downloads/reference/` | 精确输入、字段归属清单、示例清单与完整反例下载 |

使用 `npm run docs:generate` 生成；`docs:check` 拒绝过期字节或手动修改的派生结果。统一 output-manifest 同时覆盖课程和参考，生成器只能写受管目录，不能覆盖唯一源码。

字段覆盖遍历全部 `properties`，包括 if/then/not 中的条件出现位置；另记录 Schema 字典及 UI 的 locale/key 两层字典。每条记录关联结构锚点、行为锚点和登记示例。新增定义必须明确归属；输入不能在普通生成过程中悄悄升级。结构表的 required 只适用于显示的对象/分支，完整条件规则保留在可展开 JSON 中；Schema 没有 default 不代表运行时默认值。字段数量用于发现遗漏，不能代替行为复核。

更新行为时，核对固定 commit 的 Loader/公开合同；两个语言共用锚点，保留相同技术代码。修改 `reference/prose/`，再运行内容回归、构建和受影响浏览器检查。普通文案修订无需运行游戏。新增运行能力声明必须另提供相应证据。

具有固定 Windows 工具和快照的维护者可运行：

```sh
npm run reference:check
npm run reference:verify
```

前者重新执行并写入收据；后者只接受与已提交收据完全一致的结果。四个上游目录共 15 次检查；反例对源码和全新解压 ZIP 各执行 pack/scene/graph/interface，共 8 次。原始输出保留在忽略的 `artifacts/w5/`。静态通过示例仍没有本站新增游戏观察，SceneAbiLab 的 DLABI2005 警告原样保留。

反例的 pack validate 通过，但 scene/graph/interface 必须退出 1，诊断消息包含 DLMAT1002。这说明结构接受不能替代语义解析。它不是 UBO 正向预设；严禁把 expected-rejected-combination 改为 static-passed 来消除失败。当前集合没有正向 UBO 运行证据。公开功能索引逐项保留这一证据差异。

历史 Catalog.supportedFormats.manifest=[3,4]、旧指南的 11 个输入和早期 temporal.runtimeReady=false 均保留原始身份。当前 v5 Schema/Loader 以及 completion 的 23 个输入分别解释，不修改冻结文件来制造一致性。v3/v4 在兼容页独立生成，不能将共享定义的存在解释为根入口允许使用它。
