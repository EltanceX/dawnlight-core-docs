---
title: 大型包功能关系与案例索引
description: 大型包功能关系与案例索引：操作步骤、精确输入、预期结果与验证边界。
lang: zh-CN
dawnlight:
  publication: published
  baseline: candidate-f8aaa5c4
  manifestVersions:
    - 3
    - 4
    - 5
  sceneAbiVersions:
    - 1
    - 2
  sourceRefs:
    - repository: website
      path: metadata/w7-case-studies.json

---

# 大型包功能关系与案例索引 {#overview}

<BaselineNote />



## 按功能切片，按版本阅读 {#method}

下面三图从固定 commit 的选定 Manifest/fragment 字节提取关系，文件 SHA-256、原始路径、条件和命令顺序由[案例投影](/downloads/examples/w7-case-studies.json)记录。图用于学习局部依赖，不是所有选项下的完整活动图。保留原始 ID、版本与资源归属；网站不再分发完整大型作品，也不复制其图片、纹理和私有宿主接口。

## Dawnlight v3.1：分离高光链与最终输出 {#dawnlight}

此目录 Manifest v3，不能直接宣称为 v5 Scene 路由示例。选定 composites.json 包含 composite1 → composite2 → composite3，依次写 highlight_texture、blur_temp_texture、另一张 blur_temp_texture。output.json 另有 final 写 screen_output/texture_history current，screen_output 包含 present 和 historyCommit。图中省略大量场景、云、水与阴影依赖。

<CaseStudyNote id="dawnlight" />

阅读任务：跟踪一张高光资源的尺寸与 sampler，比较独立中间纹理与原图回写的成本，按 manifest 组合找到最终绑定。不要把这张局部图当成全部 barrier 与 phase 顺序。

## ToonLab v0.1 v4：从光照颜色到描边 {#toonlab}

明确选用 shaderpack-candidates/ToonLab_v0.1_v4，Manifest v4；不要与 shaderpacks 下的旧入口混淆。final 写 toonlab:lighting/color；toon_outline 读取光照颜色、深度、normal、identifier 及 particles/coverage，写 toonlab:final/color 与 history current，然后 screen_output present/commit。ambient_occlusion 是另一条前置功能切片。

<CaseStudyNote id="toonlab" />

与[亮度描边](/recipes/luma-outline)对比：额外几何/类别缓冲可减少纯颜色方法的歧义，同时增加 attachment、采样和覆盖合同。不要从名称猜测 normal/identifier 的固定宿主编码，应追踪此包的 writer 与 decoder。

## MakeUp v0.21：显式时序 resolve 与提交 {#makeup}

Manifest v5 / Scene ABI v2。taa.json 的 makeupsc:taa 只在 taa_mode∈{1,2} 活动，按顺序执行 taa_resolve、taa_apply、color commit、depth commit。它读取当前 scene/color/depth 与 previous color/depth，写 current history 并回写场景颜色。bloom_chain_2/3/4 是不同条件的独立图分支，不能把三个都算作同时活动。

<CaseStudyNote id="makeup" />

学习关闭一个可选功能时的完整 Resource/Program/Service 闭包，区分声明规模与实际活动成本。MakeUp 的原始 UPSTREAM/归属及版本应保留；本轮关系提取不重新授予其资源许可，也不复用其上游实机/性能结论。
