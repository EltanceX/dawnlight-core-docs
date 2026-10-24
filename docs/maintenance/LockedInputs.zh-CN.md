# 锁定输入与工具链维护

适用阶段：W1 工具链与 W2 公开网站。锁定宿主 commit 为 `f8aaa5c4218f54536ccf994a2d512aed2e3678b7`。公开来源可在 [Gitea](https://gitea.com/EltanceX/DawnlightCore) 查看。

## 1. 日常核对

普通网站只需 `npm ci` 与 `npm run docs:build`，不执行本节命令。公开 checkout 不包含完整上游快照；完整工具链维护者应先恢复输入，再进行只读核对：

```powershell
node scripts/restore-upstream.mjs
node scripts/acquire-tool.mjs
node scripts/verify-upstream.mjs
node scripts/validate-upstream.mjs
node --test scripts/tests/locked-inputs.test.mjs
```

脚本以自身所在工程为根目录，可从任意 cwd 调用。`validate-upstream.mjs` 将 Analyzer 的 cwd 放在系统临时目录，显式传入锁定快照路径，并在检查前后复验快照及工具。工具直接运行自包含 EXE，不调用 `dotnet run`。

所有工具链脚本使用 Node 内置模块，不依赖 `node_modules`。W1 本机验证使用 Node 26.7.0；W2 网站及 CI 固定 Node 24.22.1、npm 11.19.0 与 VitePress 1.6.4，见根目录版本文件。

## 2. 下载来源和凭据

固定资产位于私有宿主仓库的工具专用 prerelease：

- 仓库：`EltanceX/DawnlightCore`。
- 标签：`docs-tools-f8aaa5c4-w1.1`，目标为上述精确 commit。
- 工具 ZIP：`shaderpack-analyzer-docs-tools-f8aaa5c4-w1.1-win-x64.zip`。
- 作者快照 ZIP：`dawnlight-authoring-docs-tools-f8aaa5c4-w1.1.zip`。
- 来源清单、逐文件工具清单和 SHA256SUMS 同时附在 Release。

本地使用已登录且具有该仓库读取权限的 `gh`。脚本仅请求明确标签下的明确文件名，先核对 ZIP 长度和 SHA-256，再解压并核对完整目录清单；不使用 `latest`。

下载遇到 EOF、连接错误、超时或 HTTP 429/5xx 时最多尝试三次，间隔两秒。权限错误和哈希不符直接失败，不切换版本或来源。

手动完整工具链 CI 需要 secret `DAWNLIGHT_ASSETS_TOKEN`，赋予源仓库 Releases 读取所需的 Contents read 权限。跨仓库下载不能依赖文档仓库自己的 `GITHUB_TOKEN`。Token 通过 `GH_TOKEN` 注入 `gh`，不写入文件、URL 或日志。公开网站检查和部署工作流不需要该 secret。

[locked-inputs.yml](../../.github/workflows/locked-inputs.yml) 提供手动触发的 Windows 下载和验收流程，先恢复快照再核对。网站公开仓库已经建立，但该 secret 尚未配置，此手动工作流也尚未执行；不将公开网站 CI 成功写成完整 Analyzer CI 成功。W1 已验证相同脚本在全新目录实际下载恢复。公开读者当前不能匿名获取这套私有工具资产，公开下载策略需后续另行安排。

## 3. 恢复与离线使用

`vendor/dawnlight/` 是本地完整受管目录，由 `.gitignore` 排除，不能强制加入公开仓库。以下恢复命令会用验证后的快照替换该目录；手工修改前应先保存自己的副本。

```powershell
# 从固定 Release 恢复作者快照。
node scripts/restore-upstream.mjs

# 使用已有下载缓存，禁止网络获取。
node scripts/acquire-tool.mjs --offline
node scripts/restore-upstream.mjs --offline

# 或指定离线介质中的 ZIP，仍须通过 lock 的哈希检查。
node scripts/acquire-tool.mjs --archive 'D:\authoring-assets\shaderpack-analyzer-docs-tools-f8aaa5c4-w1.1-win-x64.zip'
node scripts/restore-upstream.mjs --archive 'D:\authoring-assets\dawnlight-authoring-docs-tools-f8aaa5c4-w1.1.zip'

# 在新建的隔离工程目录中下载、恢复并运行完整验收。
node scripts/rehearse-toolchain.mjs
```

缓存位于 `.cache/`，原始输出位于 `artifacts/w1/`，均不提交。已存在但被修改的工具缓存会报错，获取命令不会静默覆盖；确认后显式移走该缓存，再重新获取。

## 4. 精确字节和导入

白名单定义于 [upstream-import.json](../../metadata/upstream-import.json)：选定单文件与四套完整示例目录。导入从固定 commit 的 Git blob 读取，不读取工作树文本，也不统一换行。生产示例中的纹理、include、组合配置、说明和 License 一并保留。

```powershell
# 维护者显式指定本地宿主路径；它不是普通构建依赖。
node scripts/import-upstream.mjs --source-root '<clean-host-repository>'
```

宿主 HEAD 必须等于锁定 commit，工作树必须干净。结果先写入暂存目录，验证后替换 `vendor/dawnlight/`。默认导入必须与现有 lock 完全一致，否则拒绝更新。只有经过审查的基线变更才使用 `--update-lock`。

根目录 `.gitattributes` 对快照设置 `-text`。上游 `.gitattributes` 作为 `upstream.gitattributes.txt` 保存，避免它在子目录中重新激活换行转换；其原始字节和来源路径仍在清单中。回归测试会实际执行 `core.autocrlf=true` 的提交与克隆，再核对全部快照。

`source-inventory.json` 固定每个受管文件的路径、长度、SHA-256、来源和 Git blob OID；它本身由 lock 固定。收据使用来源 commit 时间，不将每次执行时间混入快照。

## 5. 网站 v5 指南变体

原始指南保留在 `authoring/docs/ShaderPackAuthorGuideP11V5.md`，仍应报 `DLTOOL2001`。这条预期失败是基线的显式例外，不算原始指南成功。

`dawnlight-v5-guide-site-v1` 仅为说明性 JSON 块替换一对围栏，并添加派生身份提示。原始七个 `file=` 块保持不变；变换记录保存输入、输出哈希和修改行。网站变体通过 `docs verify-v5`，抽取的七个文件与 `CustomDataLab_Both` 逐字节一致。

变换脚本只接受精确的一处说明块，发现上游结构变化会失败。不要将变体写回原始文件，也不要消除原始失败记录。

## 6. 工具重建与升级

当前工具从固定 Git 归档重新执行 `dotnet publish -p:PublishProfile=win-x64` 得到。完整工具清单含 278 个文件，覆盖 .NET 自包含运行时、依赖、作者资产和入口。

工具 ZIP 固定本次构建的确切字节。源工程 NuGet 依赖尚未完全锁定，不承诺将来重新构建生成相同二进制。升级时应选择新的分发 ID，保留旧资产：

1. 审查新 commit、来源白名单、合同与能力差异。
2. 准备干净宿主仓库和 .NET 10 SDK。
3. 显式执行 `prepare-tool.mjs --source-root '<repo>' --id '<new-distribution-id>' --update-lock`。
4. 执行 `import-upstream.mjs --source-root '<repo>' --update-lock`，审查来源与清单差异。
5. 执行只读验收、回归测试和 `package-upstream.mjs --update-lock`。
6. 将新资产和来源清单上传到指向精确 commit 的新 Release；保留旧标签与文件。
7. 使用空缓存运行 `rehearse-toolchain.mjs`，记录实际下载结果后更新验收与 lock 状态。

新的源码 commit 还需同步更新 lock、白名单和基线来源映射，不能只改工具 ID。发布后脚本禁止用相同工具 ID 重建或用改变后的内容覆盖同一快照身份。

## 7. 验收边界

校验 Schema、Loader、Scene/Graph、Program/Data interface 和 materials layout 只能确认相应静态与离线语义。输出继续保留 `driverStatus=notProvided`、`mappingStatus=deferred`、`runtimeEvaluated=false`、`liveWorldVerified=false`。

游戏内 GLSL 编译、FBO、截图、材质映射、生命周期与性能验收需独立证据。W1 不提升这些证据等级。
