---
title: Analyzer 与证据边界
description: 使用 ShaderPackAnalyzer 检查光影包，区分 Loader、离线接口、驱动与游戏运行证据，并理解 DLTOOL2001。
---

# Analyzer 与证据边界

<BaselineNote />

ShaderPackAnalyzer 使用生产 Loader 进行包验证，并提供 Schema、资源图、场景路由和公开接口解释。它能帮助你在运行游戏之前发现一批结构与语义问题。

## 获取当前工具

本轮锁定工具身份为 `docs-tools-f8aaa5c4-w1.1`，平台为 Windows x64，自包含 .NET 运行时。当前二进制资产位于需要读取权限的 GitHub Release，尚不是匿名下载入口。

上游源码可通过 [Gitea 公开仓库](https://gitea.com/EltanceX/DawnlightCore) 取得。需要自行构建时，请检出本基线 commit，并按上游 Analyzer README 使用 .NET 10 SDK 构建。本文中的命令假定你已有经过版本核对的 `shaderpack-analyzer.exe`。

<SourceNote path="tools/ShaderPackAnalyzer/README.md" label="Analyzer 构建、发布与命令说明" />

## 从包验证开始

```powershell
shaderpack-analyzer.exe pack validate ./MyPack --format json
```

先查看退出码、`valid` 和 `diagnostics`。修复报告中对应的文件、JSON pointer、资源或程序 ID，再进行更具体的解释。

这些命令中的 `./MyPack` 是你自己的包目录，不是网站提供的已下载示例。

## 按问题选择解释命令

::: code-group

```powershell [场景路由]
shaderpack-analyzer.exe scene explain ./MyPack --include-inactive --format json
```

```powershell [资源图]
shaderpack-analyzer.exe graph dump ./MyPack --contract 2 --include-inactive
```

```powershell [v5 程序接口]
shaderpack-analyzer.exe program interface ./MyPack --program "yourpack:post/present" --contract 2
```

```powershell [自定义数据]
shaderpack-analyzer.exe data interface ./MyPack --format json
```

:::

`yourpack:post/present` 需要替换为自己包中真实存在的 Program ID。v5 Program interface 要显式选择合同 2；省略时仍可能使用旧接口投影。

## 不同的成功分别意味着什么

| 结果 | 可以说明什么 | 还需什么证据 |
| --- | --- | --- |
| Schema 校验通过 | 结构满足对应 Schema | Loader 语义与版本化行为 |
| Loader 验证通过 | 指定包通过当前加载与语义检查 | 驱动编译、链接和资源创建 |
| 离线 graph / interface 成功 | 能解释所选输入的活动关系和接口 | 实际设备与游戏上下文 |
| 驱动报告有效 | 对应身份下有设备端观察 | 场景、生命周期和画面验收 |
| 游戏画面与性能验收 | 特定设备和场景下的观察 | 其他设备与配置的覆盖 |

当前网站基线的检查保留 `driverStatus=notProvided`、`mappingStatus=deferred`、`runtimeEvaluated=false` 与 `liveWorldVerified=false`。单次离线成功不能将这些字段改写成已经实机验证。

## 一个真实诊断：DLTOOL2001

原始 v5 指南的 `docs verify-v5` 会报告 `DLTOOL2001`：可重建指南中的三反引号代码块需要语言标记与 `file=<relative-path>`。该指南包含一段普通说明性 JSON 块，未满足这个提取合同。

网站保留原始失败，并另建有独立身份的 `dawnlight-v5-guide-site-v1` 变体。变体仅改变说明块的围栏并添加身份说明；七个文件块保持不变，抽取结果与锁定示例精确一致。

遇到这类诊断时，应检查输入文档的用途与代码块合同，避免将某个派生版本的成功当成原始输入已经成功。

<SourceNote path="docs/ShaderPackDiagnosticReference.md" label="诊断代码参考" />
