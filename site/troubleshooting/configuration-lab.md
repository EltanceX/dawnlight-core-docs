---
title: 配置错误：从诊断到修复
description: 配置错误：从诊断到修复：操作步骤、精确输入、预期结果与验证边界。
lang: zh-CN
dawnlight:
  publication: published
  baseline: candidate-f8aaa5c4
  manifestVersions:
    - 5
  sceneAbiVersions:
    - 2
  sourceRefs:
    - repository: upstream
      path: tools/ShaderPackAnalyzer/README.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: upstream
      path: docs/ShaderPackDiagnosticReference.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: website
      path: examples/diagnostics/w7-cases.json
    - repository: website
      path: metadata/w7-diagnostics.json
---

# 配置错误：从诊断到修复 {#overview}

<BaselineNote />



## 完整反例与预期结果 {#downloads}

这些 ZIP **故意无效**，仅用于离线排错；不要把它们当成可用预设。每份均从同一个独立色彩包施加一处明确变更。固定 Analyzer 对目录与新解压 ZIP 分别执行 pack、graph、Program interface，预期退出码 1；恢复原始 Manifest 后三项退出 0。三例共 27 次实际调用。

<DiagnosticLabNote />

## 读取 code、file 和 pointer {#locate}

以 unknown-provider 为例，先解压到全新工作目录，在包根运行以下命令。DLMAN0001 的 file=shaderpack.json，pointer=/passes/0/commands/0/sceneProvider/id；这是 passes 的第 1 项、commands 的第 1 项，不是文本行号。定位后看到不存在的 dawnlight:scene_draw/missing。此版本在 Loader 层报 DLMAN0001；不能凭语义把它改写为 DLABI1002。

```powershell
shaderpack-analyzer.exe pack validate . --format json
$LASTEXITCODE
shaderpack-analyzer.exe graph dump . --contract 2 --include-inactive
shaderpack-analyzer.exe program interface . --program practice:post/grade --contract 2
```

## 修复一处，然后重跑闭环 {#repair}

将该值恢复为 Catalog v2 公布的 dawnlight:scene_draw/terrain_opaque，version 保持 2。重新执行 pack → scene → graph → interface。graph 和 interface 在错误时同样保留来源，但不会凭空生成成功资源图或驱动观察。修复后检查四条 BuiltIn 路由、effect 的活动读写和唯一 present。

```powershell
shaderpack-analyzer.exe pack validate . --format json
shaderpack-analyzer.exe scene explain . --include-inactive --format json
shaderpack-analyzer.exe graph dump . --contract 2 --include-inactive
shaderpack-analyzer.exe program interface . --program practice:post/grade --contract 2
```

unknown-program 恢复为 practice:post/grade；history-on-persistent 移除新增 historyCommit，不能将 persistent 纹理伪装成已具备 writer/fallback 的 History。变更配方记录在下载 JSON 中。

## 从修复配置到对应运行报告 {#report}

手工保存可能改变 JSON 字节；静态语义修复成功不再等于原 ZIP 的源码指纹。要复现本轮实机记录，重新解压[正常色彩包](/examples/practice-color-balance#download)，核对完整 inventory，再在创造世界加载、切换选项、重载、resize 和退回 BuiltIn，导出该 generation 的 Scene report。本轮非法 Provider 的帧桥请求超时，未确认运行时拒绝或 generation 保留，详见[实际记录](/recipes/runtime)。

本实验未提供 RenderDoc、数据数值读回或性能门。故障消息文本仅作上下文，稳定定位使用 code/file/pointer 和精确来源。
