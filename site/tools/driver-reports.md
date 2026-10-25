---
title: Scene 与 Data 驱动报告
description: Scene 与 Data 驱动报告：操作步骤、精确输入、预期结果与验证边界。
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
---

# Scene 与 Data 驱动报告 {#overview}

<BaselineNote />



## 选择已发布 generation {#export}

在创造世界确认实际 active selection、generation 与选项后执行 `/switchshader export-driver-report`。v5 数据接口另用 `/switchshader export-data-driver-report`，要求当前已发布 v5 generation 及最终世界内容。日志给出文件路径。候选、回滚中或已退役 generation 不能导出成功记录；失败候选的诊断不能当作已生效包的报告。

## 按报告种类选择命令 {#inspect}

Scene report 检查 Program 链接、native instance 与 FBO。Data report 检查声明/准备的数据接口；两者不能互相替代。报告必须来自同一份包和选项。

```powershell
shaderpack-analyzer.exe driver-report inspect ./scene-driver.json --pack-root .
shaderpack-analyzer.exe program interface . --program practice:post/grade --contract 2 --driver-report ./data-driver.json
shaderpack-analyzer.exe data-driver-report inspect ./data-driver.json --pack-root .
shaderpack-analyzer.exe data interface . --content-snapshot ./world-final.json --driver-report ./data-driver.json --format json
```

## 匹配结果的精确含义 {#interpret}

DLREPORT0000～0020 检查格式/完整性，0101～0104 提示部分证据，1001～1010 检查包和来源不匹配；Data 接口拒绝属于 DLDATA3001。matched 只升级对应接口/Program/FBO 的观察。Data 的 valueReadback=notProvided 不提供 uniform/SSBO 数值，liveWorldVerified=false 不等于世界画面已验证。

离线 sidecar 看不到另一个进程的当前 device epoch；自洽历史报告不能仅因后来 reset 就被离线工具判 stale。与“此刻运行”的比较还需记录当前 generation/epoch。重载、修改 shader/选项、换世界或设备变化后采集新记录；保留旧报告，不手工修 hash。


已核对的错误：把 Scene report 传给 v5 Program interface 合同 2，实际返回 DLDATA2002（contractVersion 无法映射到 P11DataDriverReport）；换成匹配的 Data report 后成功。即使包没有自定义数据，也应分别导出和使用两类报告。
