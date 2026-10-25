# W7 工具、排错与效果实践验收

日期：2026-10-24。宿主继续锁定 `f8aaa5c4218f54536ccf994a2d512aed2e3678b7`，主线 Manifest v5 / Scene ABI v2。对应规划 W7，不代表完整 v1 或上游 P11 发布验收。

## 内容交付

新增 22 组双语页面，其中 19 组为作者正文、3 组为生成的独立效果下载页；同时扩充既有 Analyzer、阅读路线和首页入口。站点共 73 组内容与一组双语 404，生成 148 HTML。

- 工具：退出码、code/file/pointer、选项传输、Schema 编辑器关联和离线核验、WorldFinal 导出与材质解析、Scene/Data 报告身份匹配。
- 排错：加载/旧效果，黑白/场景缺失，MRT/输出/slot，同纹理反馈/writer/barrier，resize/切包/history，Mod 材质/内容快照，compile/link/FBO 七条症状路线。
- 修复实验：unknown-provider、unknown-program、history-on-persistent 三份完整且明确标为故意无效的 ZIP，单独发布配方和收据。
- 实践：色彩平衡、宽高比暗角、亮度描边三份完整独立包，包含源码、选项、分支、下载、成本和实际观察。复用 W6 半分辨率柔光、天气与材质课程。
- 案例：Dawnlight v3.1 / Manifest 3，ToonLab candidate v0.1 v4 / Manifest 4，MakeUp v0.21 / Manifest 5 的公开选定文件关系图。条件、版本、读写、命令顺序、路径和 SHA-256 由固定 Git blob 的有限投影驱动。
- 边界：GPU History 与 View 连续性、显式 jitter、深度重建矩阵、Light Frustum 几何与完整阴影实现的职责。

## 实际静态与工具检查

| 输入 | 已观察结果 |
| --- | --- |
| 三份有效包 | 9 分支，108 次 Analyzer 调用；源码与新解压 ZIP 归一化报告一致，0 diagnostics |
| 三份故障包 | 各 pack/graph/Program interface 在目录与新 ZIP 均退出 1，实际代码 DLMAN0001，附真实 file/pointer；恢复原始 Manifest 后三项退出 0，共 27 次调用 |
| Schema | 新显式目录 export + verify 成功；v5 Schema 与补全字节分别匹配固定公开参考输入 |
| Scene / Program | Scene report inspect matched；v5 Program interface contract 2 使用 Data report 后 matched |
| WorldFinal / Data | 使用 W6 同世界历史快照复核 materials layout/explain、data report inspect、data interface 成功，不冒充当前设备 epoch 或数值读回 |
| 报告混用反例 | Scene report 传给合同 2 返回退出 1 / DLDATA2002；匹配 Data report 后退出 0 |

有效包四条 Terrain 路由均 BuiltIn；grade-off 移除效果资源/Program/command 并直接 present 原色。Graph 分支检查显式使用 JSON-RPC contract 2 `inputs.options`；固定 CLI 不消费这些覆盖。number 整数端点保留浮点 token。

成本解释是静态名义 payload/采样计数：RGBA8 中间图为 4WH，1080p 约 7.91 MiB；色彩/暗角效果一次采样、亮度描边五次，最终 present 另需一次。strength=0 不等于移除活动效果。没有将这些估算写成 VRAM 驻留或 GPU 耗时。

目标位置和同纹理反馈的探索修改在本轮 GL-free 查询中未返回诊断。页面明确说明该观察不能证明 GL 输出映射、反馈合法性或像素正确。

## 有范围的实际游戏观察

使用与 W6 相同的固定 Windows 构建副本和二进制身份，原始游戏/存档未修改，源码工作区干净。单台 RTX 4050 Laptop GPU / NVIDIA 566.07 / OpenGL ES 3.2、一个创造世界、单主 view。

三包均完成加载、同包重载、九个分支切换、真实窗口尺寸变化与恢复、Scene report 导出和切回 BuiltIn。链接 Program 集合匹配静态分支闭包，FBO complete。实际游戏窗口截图裁去标题栏并缩小，公开三份图和三份有限生命周期摘要，由 `metadata/w7-runtime.json` 绑定。

受控非法 Provider 请求在帧桥中超时，已恢复原 Manifest 精确字节；未取得可确认的拒绝/回滚结果。记录为 `inconclusive`、`runtimeRejectionVerified=false`，不支撑失败候选保留结论。离线三份反例及修复有独立完整证据。最终清理前活动源为 BuiltIn、pending=0、error=null；隔离游戏已关闭，命令桥重置为 idle。

## 网站验收与保存

内容回归 58/58，包括故障下载哈希/修复拒绝和刷新资产哈希后仍拒绝伪造选项/链接闭包的检查。首轮浏览器 98 项中 96 通过；两项语言切换测试误用了不存在的 cases/resource-flow 锚点，修为实际 downloads/flow 后桌面与移动端定向 2/2 通过。最终构建后 W7 全部 14 项浏览器检查通过。首次公开 CI 暴露测试 fixture 未先创建 .cache 的准备错误，已补齐目录初始化，并在无缓存的独立 checkout 单独复验 W7 测试 7/7。视觉复核覆盖桌面关系图、实际效果记录和 320px 英文排错页。

构建检查 148 HTML、244 个派生产物、11621 本地链接、1827 资源引用、1651 锚点通过；npm audit 0 vulnerabilities。保留已有大型兼容参考页和 chunk 体积提示，作为 W8 资源与搜索体积检查输入。

公开 CI 使用公开源码及匹配收据，重新生成并验收网站；不需要私有工具、世界或 GPU。部署与线上完整套件的实际结果在发布后绑定 main commit 与 Actions run，保存于忽略的 `artifacts/w7/`，不提前记录为部署成功。

W0～W6 冻结记录与前十一包 94 个源码文件逐字节保持；旧 ZIP/source 身份继续由旧 release 账本校验。公开边界不含完整快照、宿主二进制、原始驱动/Data/WorldFinal 报告与帧桥。CNAME、域名、DNS、HTTPS 状态保持。独立真人试读、性能门、数值读回、其他 GPU/平台、device loss、VR、多 view、TAA/阴影质量未验收。

维护流程见 [W7 维护说明](../maintenance/PracticeAndTroubleshooting.zh-CN.md)。
