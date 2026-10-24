---
title: 版本与支持范围
description: 当前文档的宿主 commit、Manifest v5、Scene ABI v2、工具身份和支持边界。
---

# 版本与支持范围

<BaselineNote />

本版文档围绕一个固定宿主基线编写。主线讲解 Manifest v5 / Scene ABI v2；v3/v4 的历史示例用于兼容说明，不能直接替代新的 v5 课程包。

## 版本身份

| 项目 | 当前值 |
| --- | --- |
| 宿主 commit | `f8aaa5c4218f54536ccf994a2d512aed2e3678b7` |
| Manifest | 5 |
| Scene ABI | 2 |
| materials / customData ABI | 1 / 1 |
| Manifest composition | 1 |
| Catalog / Graph 输出合同 | 2 / 2 |
| v5 Program interface | 显式合同 2 |
| 固定工具 | `docs-tools-f8aaa5c4-w1.1` |

这些数字分别属于不同合同，不能用一个“v5”概括所有接口版本。当前版本信息也可[下载为 JSON](../downloads/site-baseline.json)，用于核对这次文档预览。

公开源码入口为 [Gitea / EltanceX / DawnlightCore](https://gitea.com/EltanceX/DawnlightCore)。本轮已匿名核实该仓库和上述 commit 可访问。正文来源链接固定 commit，升级上游默认分支不会自动改变本文基线。

## 支持边界

| 范围 | 当前说明 |
| --- | --- |
| 首版运行目标 | Windows x64、.NET 10、OpenGL ES 3.2、单主 view |
| 公开资源类型 | `texture2D`、`textureCube`、`buffer` |
| materials / typed custom data | 已有公共合同与离线工具路径，实机声明按具体证据记录 |
| Android ARM64 | 已有准备资料，真机待验收 |
| Frame / Transient lifetime | 存在预留 token，当前资源转换器拒绝，不能作为可用分配器 |
| 通用 texture3D / textureArray 声明 | 不在当前公开 resourceKind 范围 |
| Geometry / Tessellation stage | 不提供未公开配置入口 |
| 分屏、多 view、完整 VR 光影 | 不在本基线的承诺范围 |

G9 比较采样、公共时序 view、jitter 与光源几何均有各自的版本与能力边界。后续参考页会分别展开，不能因为一个 token 已出现就推导任意执行环境都支持。

## 本轮已核对什么

锁定输入与工具链完成了 19 项 GL-free 检查：18 项成功，1 项确认原始指南的已知 `DLTOOL2001` 失败。独立网站指南变体通过重建校验；四套代表性上游包通过 Loader。另有 6 项工程回归测试覆盖篡改拒绝、换行保留与恢复等行为。

这些结果记录在对应基线，不能推广为每一种包配置都能运行。当前没有新增 GPU 运行、游戏截图、运行时材质映射或性能验收。

## 文档建设进度

目前可阅读：阅读路线、管线模型、资源与目标、Analyzer 和版本范围。连续教程、起步包、下载示例与完整字段参考仍待后续阶段实现，未完成页面不会进入导航。

网站源码与正文公开，完整上游快照继续保留在本地和固定私有资产中。网站静态构建只使用已提交的公开页面和锁定元数据；上游完整 Analyzer 验证通过独立流程执行。
