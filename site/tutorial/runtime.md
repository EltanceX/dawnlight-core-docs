---
title: 实机观察与复现记录
description: 测试宿主身份、真实驱动报告、生命周期观察和 W4 证据边界。
lang: zh-CN
dawnlight:
  publication: published
  baseline: candidate-f8aaa5c4
  manifestVersions:
    - 5
  sceneAbiVersions:
    - 2
  sourceRefs:
    - repository: website
      path: metadata/w4-runtime.json
    - repository: website
      path: metadata/w4-reviewed-sources.json
---

# 实机观察与复现记录 {#runtime}

<BaselineNote />

2026-10-24（America/New_York），五个课程快照在复制出的 Windows Debug 构建中运行。该目录源码 HEAD 为 **f8aaa5c4**，与网站锁定基线相同，源码工作区干净；EXE/DLL/Content 指纹标识用户提供的构建，不等于已证明可重复构建。原运行目录、存档和设置未修改。测试新建创意世界，种子 Dawnlight-W4，固定白天。

## 宿主与方法 {#host}

驱动报告为 **OpenGL ES 3.2 NVIDIA 566.07**、**NVIDIA GeForce RTX 4050 Laptop GPU**、GLSL ES 3.20。隔离 init.js 测试钩子在真实游戏帧调用公开切包协调器，记录发布 generation、待处理请求、错误与窗口大小。另用 computer-use 查看真实窗口，确认 **U → Shader Packs → 选中 → Apply**；单纯选中时原活动来源仍保留。截图是窗口捕获，仅裁掉标题栏并缩小尺寸，不是浏览器或离屏渲染结果。

![起步包已激活的来源选择器](/media/w4/loading-menu-active.jpg)

先前更正前的运行目录不计入本记录。公开驱动报告不含复制的内置 shader 源码。

## 检查结果 {#results}

每个快照均完成加载、同包重载为后续 generation、在 2048×1222 与 1024×640 间调整窗口，再切回 BuiltIn，没有切换错误。全部已报告 Program 链接成功；固定 Analyzer 将驱动报告与包、全部包自有 Program 接口匹配。本次运行查询使用 Scene Program interface 合同（默认 v1）；课程 v5 静态检查另使用其支持的合同 2，不应把 Scene 驱动报告交给 data-interface 的报告读取器。

| 章节 | 驱动 / 生命周期 / 画面 |
| --- | --- |
| [course/00-starter](/tutorial/00-starter) | [驱动报告](/evidence/w4/00-starter-driver.json) · [生命周期](/evidence/w4/00-starter-lifecycle.json) · [画面](/media/w4/00-starter.jpg) |
| [course/01-first-post](/tutorial/01-first-post) | [驱动报告](/evidence/w4/01-first-post-driver.json) · [生命周期](/evidence/w4/01-first-post-lifecycle.json) · [画面](/media/w4/01-first-post.jpg) |
| [course/02-resources](/tutorial/02-resources) | [驱动报告](/evidence/w4/02-resources-driver.json) · [生命周期](/evidence/w4/02-resources-lifecycle.json) · [画面](/media/w4/02-resources.jpg) |
| [course/03-scene](/tutorial/03-scene) | [驱动报告](/evidence/w4/03-scene-driver.json) · [生命周期](/evidence/w4/03-scene-lifecycle.json) · [画面](/media/w4/03-scene.jpg) |
| [course/04-mrt](/tutorial/04-mrt) | [驱动报告](/evidence/w4/04-mrt-driver.json) · [生命周期](/evidence/w4/04-mrt-lifecycle.json) · [画面](/media/w4/04-mrt.jpg) |

![切回 BuiltIn 后的画面](/media/w4/builtin.jpg)

## 从新目录复现 {#reproduction}

将第 01 章确定性 ZIP 解压到新建 shaderpacks/reader-first-post 目录，不依赖前章文件即加载成功。保存 strength=0.0、1.0 两次编辑后，分别发布新 generation；最后恢复原字节并切回 BuiltIn。[机器记录](/evidence/w4/reader-reproduction.json)。这是代理按读者步骤重走，**尚未完成独立真人可用性测试**。

记录的卡点：多一层解压目录就不能发现；选中来源与活动来源不同；刷新目录不等于重编译 GLSL；fallback 声明不能直接填写 drawBuffers；宿主法线是 oct 编码，不是 XYZ；内置离屏截图助手不能正确捕获外置 present 输出，因此改用窗口截图。隔离副本首次启动还引用了缺失的默认 Dawnlight_v3.1 来源并回落 BuiltIn，该历史警告在成功切包后仍留在标题栏，不是课程包加载失败。

## 证据边界 {#limits}

仅一个 GPU、一个世界的有限观察。device reset、Android、VR、所有 Terrain 类别及各条件下的粒子、BuiltIn 像素等价、性能与独立真人试用仍未验证。MRT 辅助数据只覆盖 opaque Terrain；第 03 章光照刻意简化，第 04 章展示编码字节而非解码方向，不声明完整可见表面 G-buffer。旧 ZIP README 和静态收据中的运行标记保留其原始证据范围，本页按日期添加独立观察。

[机器身份和文件哈希](https://github.com/EltanceX/dawnlight-core-docs/blob/main/metadata/w4-runtime.json) · [开始第 00 章](/tutorial/00-starter)

[宿主来源复核与 Git blob 身份](https://github.com/EltanceX/dawnlight-core-docs/blob/main/metadata/w4-reviewed-sources.json)。
