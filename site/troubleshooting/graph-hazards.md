---
title: 同纹理读写、writer、顺序与 barrier
description: 同纹理读写、writer、顺序与 barrier：操作步骤、精确输入、预期结果与验证边界。
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

# 同纹理读写、writer、顺序与 barrier {#overview}

<BaselineNote />

统一顺序：加载与版本 → 路由/活动闭包 → 资源与绑定 → 静态接口 → 对应运行时报告 → 画面和生命周期。每次只改变一个因素。

## 先定位到哪一层 {#locate}

从 graph contract 2 的 active=true 节点建立本分支的 producer → resource → consumer。检查 Pass inputs/outputs 与每条 command 的 bindings/targets/access。资源存在不等于已有当前帧 writer；asset、external、clear、history fallback 与 undefined 初始化规则不同。

## 检查与修复 {#inspect}

DLGRAPH1001～1002 处理 command 访问方向，1101～1102 处理 mixed legacy，1201 的 read-modify-write 信息不等于 OpenGL framebuffer feedback 合法。fullscreen 采样正在写入的同一 subresource 应改为独立目标或合法 ping-pong。给依赖补充符合 phase 的顺序，不用互相 after 制造环。

## 重新验证与恢复 {#verify}

Compute 的 image/SSBO 可见性需声明正确 access 与后续消费，按公共 Command 合同检查 memory barrier。增加任意 barrier 不能修复同 draw 的采样反馈，也不能给缺失 writer 生成内容。关闭效果后复查活动 Program/资源/Service，不能只看 pass.enabled。graph CLI 在固定基线忽略 options；选项分支使用 JSON-RPC inputs.options。
