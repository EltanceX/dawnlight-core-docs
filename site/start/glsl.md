---
title: 课程所需 GLSL 基础
description: 掌握前五个完整光影包快照用到的 GLSL 概念。
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
      path: examples/registry.json
    - repository: website
      path: metadata/w4-runtime.json
---

# 课程所需 GLSL 基础 {#chapter}

<BaselineNote />

JSON 描述资源与执行关系，GLSL 计算顶点和像素。先读顶点 main，再读匹配的片元 main。课程使用 GLSL ES 3.20，以 #version 320 es 开头。

## 数值与阶段 {#values}

float 是标量，vec2/3/4 是向量，mat4 用来变换位置，uint 保留整数标识符。uniform 由绑定供给，in/out 连接阶段；flat 避免标识符被插值。全屏顶点 shader 从 gl_VertexID 生成四边形；Terrain 则消费宿主的公开顶点属性。

## 读懂一个像素 {#pixel}

sampler2D 表示已绑定纹理，texture 用归一化 UV 采样，texelFetch 用整数像素坐标读取且不做插值。mix(a,b,s) 混合端点，clamp 限制数值。先读第 01 章完整片元 shader：

<<< @/../examples/course/01-first-post/shaders/present.psh{glsl}

## 编译与推理 {#compile}

片元 shader 保留 precision 声明，sampler 名称须精确匹配 Manifest symbol。Program 组合顶点与片元文件；源码分析成功不能证明驱动链接成功。从首条诊断的文件和行号排查，保存后强制重载。在线 shader 编辑器本身无法复现宿主绑定。

逐行回答：在哪个阶段运行、输入从哪里来、写入哪个输出 location、数值是归一化颜色、编码数据还是整数？第 04 章会依赖这些区别。

[开始第 00 章](/tutorial/00-starter)
