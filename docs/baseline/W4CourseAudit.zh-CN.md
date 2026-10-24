# W4：入门到场景接入的课程记录

- 日期：2026-10-24（America/New_York）。
- 基线：`candidate-f8aaa5c4` / `f8aaa5c4218f54536ccf994a2d512aed2e3678b7`。
- 状态：课程与工程主线已交付，有限实机观察通过；独立真人试读待完成，阶段验收未全部关闭。
- 机器记录：`metadata/w4-verification.json`、`metadata/w4-runtime.json`。

## 交付范围

环境准备、固定工具获取边界、U → Shader Packs → Apply 加载流程、GLSL 基础，以及 00～04 双语连续课程。每章包含目标、前置知识、改动、资源流、全部 shader 与 Manifest、完整下载、检查、排错、练习和下一章。

| 快照 | 本章效果与覆盖 | 资源 / 命令 / 包自有 Program |
| --- | --- | --- |
| 00-starter | 四类 Terrain BuiltIn fallback，整帧颜色与深度、原样 present | 2 / 5 / 1 |
| 01-first-post | LDR 暖色和对比度，strength 可编辑 | 2 / 5 / 1 |
| 02-resources | grade 写入独立 post/color，再 present | 3 / 6 / 2 |
| 03-scene | 仅 opaque Terrain 改为包自有 Program，其余 fallback | 3 / 6 / 3 |
| 04-mrt | opaque 写 RT0/RT1/RT2，查看法线编码或教学标识符 | 5 / 6 / 3 |

五份 ZIP 都可从新目录独立加载。课程原生 include 只允许登记的完整示例文件，双语必须引入相同文件；下载、网页代码和 Analyzer 输入共用唯一源码。公开页面总数为 42（40 内容页和 2 个 404），生成 56 个派生文件。已发布的 W3 起步包字节、源码指纹、ZIP 身份保持原样；新增快照在发布索引中单独锁定。

## 实际宿主与观察

使用用户更正后的 DawnlightCore Windows Debug 构建。对应源码 HEAD 与锁定基线一致、源码工作区干净；EXE、DLL 和 Content.zip 单独登记哈希，不把它们称为可重复构建证据。测试只复制运行必需文件到忽略的 `.cache/w4-runtime-pinned/`，新建 `Dawnlight-W4` 创意世界，原运行目录、设置和存档未修改。

驱动为 OpenGL ES 3.2 NVIDIA 566.07，RTX 4050 Laptop GPU，GLSL ES 3.20。通过宿主现有 init.js 帧回调调用公开切包协调器，再用 computer-use 查看真实窗口。确认选中来源不等于激活，必须 Apply；保存 GLSL 需要 Force Reload Shaders。

每个快照均记录成功加载、同包重载为后续 generation、2048×1222 与 1024×640 间窗口变化、恢复尺寸及返回 BuiltIn。所有报告的 Program 链接成功，报告的 framebuffer complete。固定 Analyzer 完成 5 次驱动报告匹配及 10 次包自有 Program 接口匹配。Scene 报告使用默认 Program interface 合同 1；课程静态检查使用其支持的合同 2，不能将 Scene 报告交给 data-interface 读取器。

公开 7 张窗口截图、5 份驱动报告、5 份生命周期记录、10 份接口报告与 1 份代理复现记录，共 28 个文件；长度和 SHA-256 写入运行清单。截图只裁去标题栏并缩放。测试结束时已切回 BuiltIn，并正常关闭隔离游戏。

## 复现和修正

代理从第 01 章 ZIP 解压到另一个新目录 `reader-first-post`，不依赖前章文件加载；将 strength 保存为 0.0 和 1.0，两次均编译并发布新 generation，最后恢复源码和 BuiltIn。该记录是代理按读者步骤重走，`independentHumanReader:false`，不替代不熟悉内部结构的真人试用。

已记录并修正的卡点包括：多一层解压目录无法发现；刷新目录不等于重载；fallback 不可直接写 drawBuffers；宿主 normal 是 oct RG 字节和 Z 符号字节，不能用 RGB×2−1 当作 XYZ；离屏截图助手未正确捕获外置 present，改用窗口截图。第 04 章修正后重新执行静态和实际运行检查，再冻结新源码身份。宿主事实另用 `metadata/w4-reviewed-sources.json` 记录精确 Git blob 身份，W0 source-map 不改写。

## 本地检查

| 检查 | 结果 |
| --- | --- |
| 固定 Analyzer | 50 次源码 / 新解压 ZIP 调用通过，输出哈希一致 |
| 内容回归 | 27/27，含过期源码/图片证据、缺失接口、文件篡改和无实际尺寸变化的拒绝 |
| 既有锁定输入回归 | 6/6 |
| 静态网站 | 42 HTML、1,518 本地链接、513 资源引用、273 章节锚点通过 |
| 浏览器 | 桌面与手机 60/60；覆盖双语课程、章节切换、原生代码复制、五包全部下载、证据哈希、MRT/oct 搜索和 320/768/1024px 布局 |
| 视觉复核 | 桌面/手机课程与真实游戏截图已检查 |
| 公开边界 | 游戏二进制、完整快照、工具、世界和本地原始报告均不进入 Git；域名及 HTTPS 配置不变 |

公开 CI 重新生成下载、校验已提交的静态和运行证据并执行浏览器检查；不声称 Linux CI 启动了 Windows 游戏或重新运行固定 Analyzer。部署及线上验收由本次 main 工作流和本地 `artifacts/w4/` 的线上报告另行保留。

## 保留的验收边界

只观察一台 Windows / NVIDIA 设备、一个创意世界和一个主 view。未完成独立真人试用、device reset、Android、VR、完整类别与粒子覆盖、性能或正式发布验收。第 03 章使用简化光照，无 BuiltIn 像素等价声明。MRT 辅助数据只覆盖 opaque Terrain，不构成完整可见表面 G-buffer；教学材质字节也不是稳定内容 ID ABI。

后续可继续 W5 参考文档；W4 独立读者试用应单独补记，不能将代理复现更名为真人验收。
