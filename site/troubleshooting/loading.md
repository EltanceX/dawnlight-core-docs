---
title: 包未显示、加载失败或仍是旧效果
description: 包未显示、加载失败或仍是旧效果：操作步骤、精确输入、预期结果与验证边界。
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

# 包未显示、加载失败或仍是旧效果 {#overview}

<BaselineNote />

统一顺序：加载与版本 → 路由/活动闭包 → 资源与绑定 → 静态接口 → 对应运行时报告 → 画面和生命周期。每次只改变一个因素。

## 先定位到哪一层 {#locate}

先核对目录是否为 shaderpacks 的直接子目录、shaderpack.json 是否在包根、Manifest/ABI/宿主版本和所选包名。排除多套游戏目录与双层解压目录。对当前目录运行 pack validate；DLMAN/DLSCHEMA 属于作者输入，DLABI1 属于 Catalog ID/版本/身份，不能先去修改 GLSL。

## 检查与修复 {#inspect}

加载或重载后比较实际 active selection、published generation、LastError 与源码身份。候选失败时旧 generation 可能仍在正常显示，因此“画面还在”不是新包成功。恢复已知可用 ZIP，再次切换同名包；无法恢复时 `/switchshader builtin`。安装新 C# 宿主必须重启，重载 JSON 不会更新进程代码。

## 重新验证与恢复 {#verify}

DLMAN0001 的真实 Provider 错误及完整修复见[配置实验](/troubleshooting/configuration-lab)。保留旧源码指纹与报告，在修复成功后采集新报告。
