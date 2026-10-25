---
title: 世界内容快照与材质解析
description: 世界内容快照与材质解析：操作步骤、精确输入、预期结果与验证边界。
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
---

# 世界内容快照与材质解析 {#overview}

<BaselineNote />



## 从目标世界导出 {#export}

进入要测试的世界并完成 Mod/方块内容注册，然后在游戏聊天中执行 `/switchshader content-export`。日志给出导出绝对路径；复制这个文件到作者工作目录，保留原件。WorldFinal 描述该世界最终逻辑/有效内容 ID、owner 和注册身份；它不是方块截图或通用 Mod 数据库，不会让 Analyzer 执行 Mod DLL。不同 Mod 集合应分别导出。

## 解析并对照 mapping {#resolve}

在包根目录执行以下命令。先检查退出码和 diagnostics，再检查每条 mapping 的匹配与 fallback。没有快照时 deferred/null 是缺少上下文，不等于“这个 Mod 不存在”。可选内容使用 onMissing=skip，必要内容应报告缺失，不能靠改英文方块名匹配。

```powershell
shaderpack-analyzer.exe materials layout . --format json
shaderpack-analyzer.exe materials explain . --content-snapshot ./world-final.json --format json
shaderpack-analyzer.exe data interface . --content-snapshot ./world-final.json --format json
```

## 何时重新导出 {#identity}

更改 Mod 集合、内容 owner、最终注册结果或相关宿主基线后重新导出。比较报告中的 content/source/generation 身份，不能只比较文件名。materialTable 是 allocator 初始化的只读 SSBO；mapping 匹配不证明 shader 读到了正确值，布局/绑定、对应 Data report 和实际画面仍需分别检查。W6 使用同世界快照完成材质解析，记录见[实机范围](/tutorial/pack-runtime)。完整世界快照通常留在本地。
