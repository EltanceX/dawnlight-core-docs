# W6：独立光影包课程验收

- 日期：2026-10-24（America/New_York）。
- 基线：`candidate-f8aaa5c4` / `f8aaa5c4218f54536ccf994a2d512aed2e3678b7`。
- 状态：课程、分发包与有限 Windows 实机观察已交付；独立真人试读和扩展平台验收待完成。
- 机器记录：`metadata/w6-verification.json`、`metadata/w6-example-releases.json`、`metadata/w6-examples-validation.json`、`metadata/w6-runtime.json`。

## 课程与完整下载

05～10 各提供中英文正文、学习目标、前置章节、本章改动、完整同源文件、资源流、分支表、验证命令、实际观察、故障入口、练习及相邻章节链接。每章是独立完整包，网页 include、源码下载、inventory 和确定性 ZIP 共享唯一源文件。历史 00～04 的源码和五个发布身份保持不变。

| 章节 | 学习结果 | 静态与实际分支 |
| --- | --- | --- |
| 05 Options 与设置 | 可选暖色调色、Program define、动态资源闭包及包自有 UI；从 04 的 MRT 调试视图返回单色/深度拓扑 | 3 |
| 06 时间、天气与数据 | typed customData、float generation、day_time 与 precipitation、三个标量绑定 | 3 |
| 07 稳定内容与材质 | stone/sand 稳定映射、neutral fallback、属性/tag、只读 materialTable SSBO 与 flat uint 标识 | 3 |
| 08 后处理链与成本 | 独立半分辨率 LDR 五点柔光资源、三个互斥 present 路径和关闭效果后的闭包 | 5 |
| 09 完整 Amber 包 | 五个平铺 fragment、组合顺序、三个预设配方与缺失可选 Mod 内容的 skip 行为 | 6 |
| 10 验证与分发 | 独立发布身份、完整 README、文件清单与哈希、从最终 ZIP 重走作者流程 | 6 |

Amber（琥珀）形成暖对比、昼夜/降雨权重、石沙响应和可选柔光的连续风格。balanced/economy/neutral 是完整 Analyzer options 文件与 UI 手工配方；宿主不会自动从 presets 目录生成菜单。虚构 `amberdemo:MarbleBlock` 用来教学可选映射，不要求安装 Mod。

## 静态组合与分支

固定生产 Analyzer 对 26 个分支执行 438 次调用，覆盖源码目录与新解压 ZIP 的 pack、scene、graph、每个 Program interface、data 及相应 materials。零诊断、所有退出码成功；源码与 ZIP 的归一化输出哈希相等，复验与已提交收据一致。静态字段保留 `driverStatus=notProvided` 等原始证据边界，实际游戏观察单独登记。

固定版本的 graph CLI 使用空 options，因此分支图通过 contract 2 JSON-RPC `dawnlight/dumpGraph` 显式传入 inputs.options 与 capabilities。Number 类型的整数端点保留 `1.0`，避免 Integer/Number 覆盖警告。每个分支核对活动 Resource/Command/Program 集合、零 Service、四条 Terrain 路由和一个输出命令。关闭 grade 会移除调色与柔光资源及消费者，保留需要的场景与材质资源。

网站只投影本课程的平铺 fragment，不冒充通用 Loader。真实 Loader 的源码/ZIP 检查负责组合权威验证；重复模块、路径穿越和嵌套片段等错误由内容回归检测。

## 实际运行与最终 ZIP

用户更正后的 DawnlightCore Debug 构建复制到忽略的隔离目录，未修改原始游戏与存档。源码 HEAD 干净且等于固定 commit；四项宿主二进制哈希另记于 runtime 元数据。范围为 Windows x64 / .NET 10 / OpenGL ES 3.2、RTX 4050 Laptop GPU、NVIDIA 566.07、一个创造世界、单主 view。

六个包均完成加载、同包重载、真实窗口尺寸变化及恢复、26 个分支设置切换、报告导出与返回 BuiltIn。驱动 Program 链接和 framebuffer 完整，活动链接 Program 集合与静态图一致。Data report 的接口准备匹配且 interfaceComplete=true，valueReadback=notProvided；同世界 WorldFinal 用于材质解析。没有将接口匹配解释为 uniform/SSBO 数值读回。

实际设置页按 U → Options → Amber course 进入。关闭 glow 并点击 Apply 后 generation 77→78，course:glow=false，链接闭包移除 glow Program；公开前后截图及简化记录。

最终 10-distribution ZIP 从全新目录解压并逐文件核对，完成 balanced/economy/neutral 配方、保存柔光阈值修改后重载、还原源文件与原始 inventory、resize 和回到 BuiltIn。这是作者代理复现，`independentHumanReader=false`。完整 driver/Data report、WorldFinal、二进制、存档和维护桥留在本地忽略目录；公开文件仅含有限摘要、哈希和实际窗口截图。

## 网站与公开边界

| 检查 | 结果 |
| --- | --- |
| 内容回归 | 51/51；含 8 项 W6 分支、组合、Number 预设、运行摘要及刷新哈希后篡改的拒绝检查 |
| 站点构建 | 104 HTML（102 内容页与 2 个 404）；205 个派生产物；7247 本地链接、1287 资源引用、1391 锚点通过 |
| 本地浏览器 | 84 项独立检查覆盖；首轮 83 通过、1 次旧 Analyzer 页首次导航 ERR_ABORTED；该项保持代码不变连续单独复测 3/3 通过 |
| W6 浏览器 | 全部双语源文件、26 分支表、ZIP/逐文件字节、公开证据、搜索、章节语言切换与 320/768/1024px 宽度通过 |
| 视觉复核 | 已查看桌面/手机完整课程及设置界面截图；页面无横向溢出 |
| 公开边界 | 网站工程、原创课程包、公开证据摘要与截图；无完整上游快照、私有宿主源码、工具、世界或原始驱动报告 |

公开 CI 在没有私有资产时校验指纹和收据、重新生成网站、运行内容与浏览器检查；专用锁定输入工作流增加 W6 Analyzer 复验。部署与线上完整浏览器结果关联本次 main 提交，并保存在忽略的 `artifacts/w6/`；不提前记为运行成功。

W0～W5 冻结记录、原五份课程源文件与 ZIP 身份保持不变。域名、DNS、HTTPS 与 CNAME 保持现状。独立真人新手试读、其他 GPU/驱动、Android、VR、多 view、device loss、数值读回与性能门均未验收；现有兼容参考页及搜索索引的体积告警保留为 W8 审查输入。本次课程交付不等于上游 P11 release acceptance matrix 或完整网站 v1 发布。
