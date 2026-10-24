# DawnlightCore Course 00 — External starter / 外置起步包

Source baseline / 宿主基线: `f8aaa5c4218f54536ccf994a2d512aed2e3678b7`.
Manifest v5 · Scene ABI v2 · Windows x64 · single main view.

## Scope / 范围

This is a website-authored external pack, not the engine's BuiltIn Minimal descriptor.
Four explicit Terrain SceneDraw declarations use category-specific built-in fallback
programs. A viewport-sized RGBA8 color texture and depth24 texture form `frameTarget`.
The final pack-owned Program copies scene color to the engine framebuffer without an
additional color transform. No optional effects, material mappings or custom data are declared.

这是网站自有的外置起步包。四类 Terrain 都显式声明 SceneDraw，并使用各自的内置 fallback
Program；颜色和深度资源属于本包，最终由本包的 present Program 输出。它会分配两张纹理，
不能当作零扩展资源的 BuiltIn Minimal。`frameTarget` 在帧开始清理目标；Terrain opaque
按当前 Scene ABI 再初始化深度，其他 Terrain 命令加载已有附件，保留已有颜色。

## Static validation / 静态验证

Use the pinned `docs-tools-f8aaa5c4-w1.1` Analyzer:

```powershell
shaderpack-analyzer.exe pack validate . --format json
shaderpack-analyzer.exe scene explain . --include-inactive --format json
shaderpack-analyzer.exe graph dump . --contract 2 --include-inactive
shaderpack-analyzer.exe program interface . --program course:post/present --contract 2
```

The website pipeline validates both this source tree and a freshly extracted ZIP,
then compares their file hashes and Analyzer results. Extract the ZIP to a new directory:
`shaderpack.json` is at the archive root, with no dependency on another course chapter.
The adjacent `source-inventory.json` and `validation.json` describe the exact archive.

下载后解压到新目录，根目录直接包含 `shaderpack.json`。不要将独立网页片段当作完整包。
后续完整的宿主安装、加载/重载与逐章修改教程在 W4 补齐。

## Evidence / 证据边界

Loader, route resolution, graph and static source-contract checks are GL-free.
They do not compile/link on a GPU or verify actual game images, resize, reload or device reset.
`driverStatus=notProvided`, `runtimeEvaluated=false`, `liveWorldVerified=false`, `visual=notRun`.

尚未进行真实游戏验证；静态通过不能证明天空、模型、透明物体、粒子、色彩、UI 或生命周期
在实机上表现正确。W4 需要逐项验证这些场景。No runtime screenshots are supplied.
