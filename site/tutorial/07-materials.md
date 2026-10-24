---
title: 07 · 稳定内容与材质表
description: 制作、验证并分发完整独立琥珀光影包，包含同源代码、分支收据与明确的实机边界。
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
      path: examples/course/07-materials/shaderpack.json
    - repository: website
      path: metadata/w6-examples-validation.json
    - repository: website
      path: metadata/w6-runtime.json
  example: course/07-materials
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 07 · 稳定内容与材质表 {#chapter}

<BaselineNote />

用稳定内容 ID 区分石头和沙子，通过公开材质 ABI 读取 tint、response 和 tag。前置：06、flat uint varying、SSBO。完成后能为未匹配内容保留中性 fallback，并解释几何标识符与稳定内容身份的区别。

## 本章修改与完整包 {#changes}

新增 materials.abiVersion=1 和 persistent materialTable buffer。只为 opaque Terrain command 添加 readOnly storageBuffer binding=4，inputs 同时登记表。片元 shader 引入宿主虚拟 /dawnlight/materials-v1.glsl；无需复制 helper 文件。

[上一章完整下载](/examples/06-custom-data#download) · [本章完整 ZIP、源码清单与收据](/examples/07-materials#download)

## 资源流 {#resource-flow}

<div class="course-flow">WorldFinal stable content IDs → mappings / neutral fallback → materialTable SSBO → LookupMaterial(flat identifier) → opaque RT0 → grade → present</div>

course:stones group 匹配 survivalcraft:GraniteBlock 与 BasaltBlock，另一 mapping 匹配 SandBlock；priority=10、onMissing=skip。定义 course:neutral 的 shaderId 必须为 0，其余 stone=1、sand=2。默认 tint 为白色、response=0，因此没匹配的方块原样显示。逻辑 ID、effective ID/owner、RenderIdentifier、材质 record index 和 shaderId 是不同域，禁止从某个数字硬猜树种或 BlockIndex。

vertex 将 identifier 以 flat out highp uint 传到 flat in highp uint；显式 highp 是合同要求，不能依赖默认 int 精度。LookupMaterial 返回 record，AmberTint/AmberResponse 读取声明的 property，MaterialHasTag 检查 mineral，MaterialShaderId 校验作者分配的分支。本例只是颜色响应，response 不是 PBR 粗糙度。

表的 byteSize 由最终世界布局决定，不能硬编码；16 B header 后是 lookup 和 records。每记录有 16 B 身份/tag 数据及每 property 的 16 B。本例两个 property 即每条记录 48 B，实际总长仍依赖世界。无同世界 WorldFinal 快照的 materials explain 必须保持 mappingStatus=deferred；只有 definitions/layout 合法，尚未证实世界映射或 GPU 实际读取。

## 活动分支矩阵 {#branches}

<CourseBranchNote example="course/07-materials" />

## 完整着色器 {#shader-sources}

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/course/07-materials/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/course/07-materials/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/course/07-materials/shaders/present.psh{glsl}

</details>

<details>
<summary>shaders/terrain.psh</summary>

<<< @/../examples/course/07-materials/shaders/terrain.psh{glsl}

</details>

<details>
<summary>shaders/terrain.vsh</summary>

<<< @/../examples/course/07-materials/shaders/terrain.vsh{glsl}

</details>

## 完整 Manifest 与设置 {#complete-manifest}

<details>
<summary>settings.json</summary>

<<< @/../examples/course/07-materials/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/07-materials/shaderpack.json

</details>

## 验证与画面 {#verification}

解压为 shaderpacks 的新直接子目录，在包根目录使用环境准备中安装的固定 Analyzer。预期退出码 0、无诊断；材质未提供世界快照时 deferred 是预期。进入创造世界应用设置，再重载、调整尺寸并切回 BuiltIn。

```powershell
$analyzer = "C:\Tools\Dawnlight\shaderpack-analyzer.exe"
& $analyzer pack validate . --format json
& $analyzer scene explain . --include-inactive --format json
& $analyzer graph dump . --contract 2 --include-inactive
& $analyzer program interface . --program course:scene/terrain --contract 2
& $analyzer program interface . --program course:post/grade --contract 2
& $analyzer program interface . --program course:post/present --contract 2
& $analyzer data explain . --format json
& $analyzer materials explain . --format json
```

以上 graph CLI 命令只检查默认值。已提交分支收据使用显式 inputs.options 的 JSON-RPC，见上表和[维护流程](https://github.com/EltanceX/dawnlight-core-docs/blob/main/docs/maintenance/CoursePacks.zh-CN.md)。

实际映射需加载世界后运行 `/switchshader content-export`，将该文件以 `--content-snapshot world-final.json` 传给 materials explain。用 `/switchshader export-data-driver-report` 导出 Data 接口证据；世界快照保留在本地。

<PackRuntimeNote example="course/07-materials" />

## 常见卡点 {#troubleshooting}

DLMAT1005：核对 varying 两端 flat highp uint。DLMAT1002：表只能由 readOnly storageBuffer 消费，不能当 UBO。映射都 deferred：先在加载世界后 content-export，再把同一世界快照传给 materials explain；不要下载他人的运行时槽位表。草、透明与其他非 opaque 路由仍走 BuiltIn，不保证被此材质 shader 覆盖。

## 动手练习 {#exercise}

在副本为 SandBlock 的 tint 设置轻微冷色，保留 neutral 白色；同时查看砂地和一个未匹配方块。再建立第二条同 priority 的冲突 mapping，确认工具或快照解析拒绝冲突后恢复。说明为什么不直接把 04 章 RT2 的低 16 位字节当稳定材质 ID。

[materials](/reference/materials) · [custom-data](/reference/custom-data) · [scene](/reference/scene)

[下一章: 08 · 多级后处理与成本](/tutorial/08-post-chain)
