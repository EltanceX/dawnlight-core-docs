# 独立光影包课程维护

05–10 的唯一源码位于 `examples/course/`，登记在 `examples/registry.json`。页面为人工维护的中英文配对文件；完整源码通过经过白名单检查的 VitePress include 引入。生成的示例详情、逐文件下载和 ZIP 共用相同文件字节。新包使用 `validationStage=w6`，历史 00–04 的源文件、收据与发布索引保持冻结。

使用 `.node-version` 指定的 Node 24.22.1 与 npm 11.19.0。普通公开 CI 无需私有工具或游戏：

```powershell
npm ci
npm run test:content
npm run docs:build
npm run test:site
```

本机使用已安装的 Edge 时设置 `PLAYWRIGHT_CHANNEL=msedge`。在线验收另设 `SITE_URL=https://core.eltancex.top/`。生产域名、CNAME 与 DNS 不属于课程改动范围。

取得锁定的 Analyzer 后执行 `npm run examples:w6:verify`，它不会重写收据。只有创建新版本并准备审查时才用 `examples:w6:check` 更新新记录。`metadata/w6-example-releases.json` 锁定六个下载身份；不能在既有发布 ID 下静默替换字节。新增版本需新 ID、新源码目录和新指纹 URL。旧 W4/W5 记录无需跟着追加新结果。

## 分支与组合验证

固定工具的 `graph dump` CLI 构造空 options；即使传入选项文件，也不能据此声称分支已检查。`scripts/validate-w6-examples.mjs` 通过 `scripts/lib/analyzer-rpc.mjs` 调用 `dawnlight/dumpGraph`，requestVersion=2、clientSupportedVersions=[2]，显式传入 `inputs.options`、`inputs.capabilities={}`、`includeInactive=true`、锁定 catalogHash 与无 overlays。

CLI scene/data/materials/Program interface 使用相同选项文件，Program interface 显式 contract 2。JSON Number 覆盖值在整数端点也保留 `1.0`，Integer 选项仍保留整数。每个分支对源码目录与新解压 ZIP 分别检查 pack、scene、graph、全部 Program interface、data；材质章节另检查 materials。只接纳零诊断、成功退出，并比较归一化输出哈希。

图统计过滤 active=true，核对精确 Resource/Command/Program 集合、无活动 Service、四条 Terrain 路由、一个输出命令。grade=false 时 post/color、post/glow 与对应 Program/command 均不活动；材质表仍被 opaque 消费。fragment 是声明组合，不是覆盖补丁。网站投影支持本课程的平铺片段和唯一数据模块，真实 Loader 始终负责权威组合检查。

## 实机记录

`scripts/runtime-pack-check.mjs` 仅用于已经准备好的 `.cache/w4-runtime-pinned` 隔离游戏副本及其本地 frame hook。不要复制维护桥到发布包，也不要把路径改成用户的原始游戏或存档。该脚本将六个独立 ZIP 解压进隔离目录，逐分支应用值，完成同名重载、实际窗口 resize、驱动报告导出和 BuiltIn 恢复。原始报告留在 ignored artifacts；准备界面和截图需要 computer-use 技能按实际窗口逐次观察。

公开 `metadata/w6-runtime.json` 与 `site/public/evidence/w6/` 只保存必要身份、选项、链接闭包、生命周期和接口比对摘要。WorldFinal、Data 原始报告、二进制和本地日志保持私有。`scripts/lib/pack-runtime-evidence.mjs` 复核公开文件哈希、分支覆盖、实际选项、generation、resize、精确链接闭包与最终 ZIP 复现。不得把 Data prepared interface 标记为数值读回或性能测试。

全新作者代理流程必须从最终 ZIP 的全新目录开始，逐文件核对 inventory，按 README 应用 balanced/economy/neutral 配方，保存 shader 修改后重载，再还原源文件并核对原 inventory、resize、回到 BuiltIn。代理复现与独立人类试读分别登记。任何新硬件、平台、device reset、多 view 或性能结论都需要对应的独立记录。
