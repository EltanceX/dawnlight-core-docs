# W7 效果、排错与案例维护

本阶段继续使用 `candidate-f8aaa5c4`，不改域名与既有课程身份。

## 效果的唯一源码

`examples/features/{color-balance,vignette,luma-outline}` 各自包含完整 Manifest、UI、GLSL 与 README。四类 Terrain 路由均保留 BuiltIn，三个效果只使用公开的场景颜色、后处理资源和选项合同。每包有 default、grade-off、strength-max 三个分支；grade-off 应去掉效果中间资源、Program 和 command，仅保留原色 present。

`metadata/w7-example-releases.json` 冻结下载身份。已发布源码变更应新建修订身份，不能更新同名 ZIP 后沿用旧收据。前十一包的源码和 release 记录继续冻结。

```powershell
npm run examples:w7:verify
npm run test:content
npm run docs:build
npm run test:site
```

`examples:w7:verify` 在有锁定 Windows Analyzer 的维护环境复现 108 次有效包检查与 27 次反例/修复检查。显式批准新修订后才使用 `examples:w7:check` 产生候选收据并审查差异。普通 Linux CI 不取得私有工具：使用匹配源码、定义、ZIP、合同和工具身份的已提交收据，检查可确定生成结果与浏览器行为。

number 选项端点传输须保留浮点 JSON token。graph CLI 不消费分支覆盖，使用 JSON-RPC `dawnlight/dumpGraph` contract 2 的 `inputs.options`。Program interface 的 v5 查询显式选择 contract 2。

## 故障包

`examples/diagnostics/w7-cases.json` 在有效色彩包上定义三处独立改动：未知 Provider、未知 Program、persistent 资源上的 historyCommit。下载由 `diagnosticEntries` 和确定 ZIP 生成器产生；只发布变更配方和有限诊断收据，不把故障包登记进有效示例列表。

每例对源码与新解压 ZIP 执行 pack、graph、Program interface，均须退出 1、返回实际 DLMAN0001、相同归一化报告和 file/pointer。恢复原始 Manifest 后三项退出 0。修改反例时应重新取得实际诊断，不能按文字含义猜代码。

目标输出位置与同纹理反馈的两个探索修改在本轮 GL-free 查询中没有诊断。不能把它们包装成“已验证拒绝”；静态通过也不能作为 GL 输出合法性的证据。

## 两类驱动报告

Scene report 用 `driver-report inspect`；v5 Program interface contract 2 和 Data interface 消费 Data report。混用真实返回 DLDATA2002，换成匹配 Data report 后通过。当前 W7 工具复核记录在 `metadata/w7-tool-checks.json`；W6 同世界 WorldFinal、材质及 Data 历史输入仅重新检查身份与接口，不代表当前进程设备 epoch。

完整世界快照、原始 Scene/Data report、日志、二进制及帧桥只留在忽略目录。公开 `metadata/w7-runtime.json` 和六份图片/生命周期资产仅含有限身份、选项、链接闭包与观察。`loadPracticeRuntimeEvidence` 校验字节、分支、选项、Manifest、代数顺序与静态 Program 闭包，拒绝证据过期。

非法 Provider 的运行时请求在桥中超时，恢复了原始文件；没有确认运行时拒绝/回滚，不能升级为通过。正常三包的九分支、重载、实际 resize 与返回 BuiltIn 已观察。独立真人试读、数值读回、性能、设备丢失与额外平台均未验收。

## 大型包功能投影

投影只读取固定 Git blob，保留路径、长度、SHA-256、版本、条件、读写与命令顺序。可从公开上游 checkout 复核，无需完整私有快照：

```powershell
node scripts/collect-case-studies.mjs --source-root ./DawnlightCore --verify-receipt
```

不带 `--verify-receipt` 会写候选投影，应在来源升级时审查，不能用于普通构建。页面的 `CaseStudyNote` 从同一投影绘制逐 Pass 的读取 → 执行 → 写入关系，窄屏纵向排布。它不是所有选项下的完整活动图，不隐含跨文件排序。Dawnlight v3.1 是 Manifest 3，ToonLab 明确选 candidate v4，MakeUp v0.21 是 Manifest 5。不同 bloom_steps 的链互为条件分支。

大型作品不重新分发完整资源，不重新授予上游许可证，也不复用上游实验室记录为当前网站的性能/实机结论。高级页引用公开 History、Temporal View、Light Frustum 合同，不能把矩阵服务表述成现成阴影算法。

## 发布

页面在 `metadata/pages.json` 登记成对语言与共用锚点，下载、来源、案例图与证据均由固定输入生成或校验。部署继续通过 main 的 Pages 工作流，线上重跑相同 Playwright 套件并记录实际 commit、run 与下载哈希；不改 CNAME、DNS 或 HTTPS 配置。
