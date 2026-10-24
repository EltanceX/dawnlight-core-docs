---
title: 环境准备与加载
description: 准备 Windows 宿主、编辑器和固定 Analyzer，再加载完整外置包。
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

# 环境准备与加载 {#chapter}

<BaselineNote />

使用 Windows x64、.NET 10 和支持 OpenGL ES 3.2 的驱动。宿主基线为 f8aaa5c4；其他 Survivalcraft API 构建可能使用不同合同。从[公开上游](https://gitea.com/EltanceX/DawnlightCore)或可信构建取得宿主，本网站不重新分发游戏。

## 准备工具 {#tools}

安装 VS Code 等 UTF-8 编辑器，启用 JSON/GLSL 语法支持，保留 .vsh/.psh 文件名与 LF、无 BOM UTF-8。Analyzer 使用项目受控工具分发中的 **docs-tools-f8aaa5c4-w1.1**，它是固定的自包含 Windows 工具，运行不要求全局 .NET SDK。当前网站没有匿名工具二进制下载；维护者按 [LockedInputs](https://github.com/EltanceX/dawnlight-core-docs/blob/main/docs/maintenance/LockedInputs.zh-CN.md) 恢复工具。没有该资产权限的读者仍可加载章节 ZIP，并使用游戏诊断。改用其他构建前核对[工具身份](/tools/analyzer)。

## 安装外置包 {#install}

下载第 00 章，用 Get-FileHash 核对 ZIP SHA-256，再解压为以下精确布局：

```text
<GameDirectory>/
  Survivalcraft.exe
  shaderpacks/
    00-starter/
      shaderpack.json
      README.md
      shaders/
        fullscreen.vsh
        present.psh
```

```powershell
Get-FileHash .\starter.zip -Algorithm SHA256
```

目录发现只扫描 AppContext.BaseDirectory/shaderpacks 的直接子目录。ZIP 或 00-starter/00-starter 这样的多层目录不会作为加载入口。目录名是外置来源标识，Manifest id 是另一个包身份。

## 激活与修改 {#activate}

进入一次性创意世界，按 **U** 打开 Dawnlight 设置，进入 **Shader Packs** 页。刷新目录，选中子目录，再执行 **Apply**；只选中或刷新不会发布新 generation。确认的是活动来源，而不只是高亮行。保存 GLSL 后使用 **Force Reload Shaders**。失败时查看诊断，原活动 generation 可能仍在使用。恢复时选 BuiltIn 并应用。

## 首次读者检查 {#checklist}

从新目录只使用 ZIP 开始，依次检查文件扩展名、目录层级、活动来源、保存重载、resize 与返回 BuiltIn。记录宿主身份、源码指纹、观察画面和错误。[运行记录](/tutorial/runtime)列出重走过程发现的卡点。

[继续阅读 GLSL 基础](/start/glsl) · [进入第 00 章](/tutorial/00-starter)
