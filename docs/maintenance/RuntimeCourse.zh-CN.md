# 课程实机观察维护

`metadata/w4-runtime.json` 是带范围的历史观察，普通 CI 只校验记录与当前公开示例、驱动报告、接口报告、生命周期和图片的对应关系，不启动游戏。`scripts/lib/runtime-evidence.mjs` 检查所有公开证据文件的精确长度和 SHA-256。实机记录不能代替独立真人试用或性能测量。

## 本地重新观察

1. 使用源码 HEAD 与 lock 一致的 Windows Debug 构建，核对干净工作区并记录 EXE、DLL、Content.zip 的哈希。复制运行必需文件到忽略目录 `.cache/w4-runtime-pinned/`，保留原 `init.js`；不复制原设置和世界。
2. 将五个 `examples/course/*/` 完整目录复制到隔离副本的 `shaderpacks/`，各目录直接包含 `shaderpack.json`。核对复制后的源码清单与下载 ZIP 一致。
3. 将 `scripts/fixtures/runtime-frame-hook.js` 追加到隔离副本的 `init.js`。它复用宿主的帧回调，通过本地命令文件执行测试；只用于维护者控制的一次性副本。不要将该钩子放入下载包或日常游戏目录。
4. 从隔离目录启动 `Survivalcraft.exe`，新建创意世界，等待进入主视图。由用户或可用的界面工具按 U，确认 Shader Packs 页的“选中”和 Apply 行为。测试不依赖用户存档。
5. 从仓库根运行 `node scripts/runtime-course-check.mjs 00-starter 01-first-post 02-resources 03-scene 04-mrt`。需要正在运行的上述副本；15 秒无响应会失败。脚本验证新 generation、同包重载、尺寸确实改变和返回 BuiltIn，写入 `artifacts/w4/`。它不负责世界创建和截图。
6. 用固定 Analyzer 对每个导出的报告运行 `driver-report inspect <report> --pack-root <pack>`，再对全部包自有 Program 运行 `program interface <pack> --program <id> --driver-report <report>`。此 Scene 报告查询使用默认合同 1；不要将它交给 `--contract 2` 的 data-interface 报告读取器。静态课程验证仍按 `examples:check` 使用其规定的合同。
7. 捕获真实游戏窗口，逐章复核画面与排错文字。W4 发现宿主离屏截图助手不能正确捕获外置 present，因此公开图使用窗口截图。裁剪和缩放应明确记录；不应将浏览器模拟图当作游戏结果。
8. 从下载 ZIP 解压到另一新目录，按入门说明加载、修改 strength、保存重载并恢复。另请不熟悉内部结构的真人试读，独立记录，完成前保持 `independentHumanReader:false`。

脚本和钩子只生成本地原始结果，不自动覆盖已提交证据。审核后另建带日期记录，登记文件清单和来源身份，再运行内容回归、构建和浏览器验收。已发布示例修订应使用新 ID；旧发布、W0～W3 收据不改写。结束后正常关闭隔离游戏；原运行目录保持原样。
