---
title: History、时序与阴影边界
description: History、时序与阴影边界：操作步骤、精确输入、预期结果与验证边界。
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
      path: docs/DawnlightGenericCommandTypes.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: upstream
      path: docs/DawnlightTemporalViewABI.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: upstream
      path: docs/DawnlightLightFrustumGeometryABI.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: website
      path: metadata/w7-case-studies.json
---

# History、时序与阴影边界 {#overview}

<BaselineNote />



## History 是资源生命周期 {#history}

先区分持久存储与 history ring：history 声明容量、current/previous view 与 fallback，所有当前帧 writer 完成后再 historyCommit。commit 是顺序/生命周期事件，不是一次纹理写入；重复提交、没有 writer 或 writer 位于 commit 后都不能靠 barrier 修好。某一 producer 被禁用/跳过时不能假设 previous 已经前移。

MakeUp 的选定 TAA 切片声明 RGBA16F color 与 R32F depth 两槽 history，名义 payload 为 24WH 字节，另有 1×1 RGBA8 fallback；还未计其他场景目标、对齐或驻留。其 resolve → apply → 两次不同资源 commit 顺序见[案例](/cases/#makeup)。

## View 连续性不等于 GPU history 有效 {#temporal}

公共 dawnlight:temporal_view@1 的 frame/view 输入描述上次成功提交的真实主 view。MissingView 与 available + history_valid=false 不同；后者可提供当前值和 fallback previous。失败或同帧重复完整 render 不提交，跳过 view 不推进。generation/world/device/owner/camera/extent、逻辑投影、cut 与 jitter 配置变化会影响连续性。

G5 数据消费不会自动启用 jitter；dawnlight:view_jitter@1 是显式活动 Service 闭包。重建已抖深度使用 render_projection_inverse_matrix；不能用未抖旧矩阵替代，也不能重复应用相机位移或翻转 Y。view_history_valid 还不能代替某张 history 的可用性、深度一致性、屏幕边界或手部/天空分类。固定早期合同 runtimeReady=false 的历史身份与后续 G5/G6 实现资料要分别阅读。

## 光源几何不是现成阴影效果 {#shadows}

dawnlight:light_frustum_geometry@1 提供光源视锥几何与矩阵，dawnlight:light_frustum/matrix@1 表达绝对世界到原生 GL clip [-1,1]；不能再次做逻辑深度转换。服务本身不创建 shadow texture、Program 或 history，也不隐式更新旧 CSM。包负责 caster Provider 类别、targets、clear、状态、过滤、偏置和接收端采样。

公开 light_geometry Provider 覆盖的 Terrain/实例/蒙皮类别各有约束；没有对应手部、粒子或 moving-block caster 就不能宣称全场景阴影。主相机可见列表不能替代光源视锥选择。常见错误包括接收端与写入端投影/深度不一致、重复转换、错误 clear、alpha cutoff 与 bias，不应简单通过加大 bias 掩盖。

## 进阶专题的验收范围 {#acceptance}

这些是可追溯的公共合同与案例阅读，不是本轮新建 TAA/阴影包的实机验收。本轮实际运行的是三个无 history 的基础效果。时序/阴影/CSM、设备恢复、多 view、Android/VR、特殊 Mod 类别与性能必须有各自的证据；上游一份 lab 或接口探针通过，不能升级为任意作品支持。
