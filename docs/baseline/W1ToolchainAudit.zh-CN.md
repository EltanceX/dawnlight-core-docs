# W1：锁定输入与工具链验收

- 日期：2026-10-23（America/New_York）。
- 状态：已完成。机器记录见 [w1-verification.json](../../metadata/w1-verification.json)。
- 基线 ID：`candidate-f8aaa5c4`，保留 W0 的来源身份；工具和输入冻结不代表游戏运行验收完成。
- 精确宿主 commit：`f8aaa5c4218f54536ccf994a2d512aed2e3678b7`。
- 入口：[锁定文件](../../upstream.lock.json)、[维护说明](../maintenance/LockedInputs.zh-CN.md)。

## 1. 固定输入

白名单包含 432 个 Git blob，约 17.94 MB，导入后共 438 个文件：432 个原始来源文件、2 个网站变体文件、2 个 Analyzer 输出、1 个导入收据、1 个来源清单。

| 完整示例 | 文件数 | 原始字节数 | 用途 |
| --- | ---: | ---: | --- |
| Dawnlight_v3.1 | 132 | 9,439,160 | v3 兼容案例 |
| SceneAbiLab_v0.1 | 7 | 16,967 | v4 Scene/指南案例 |
| CustomDataLab_Both | 7 | 23,699 | v5 材质和自定义数据案例 |
| MakeUpUltraFast_SC_v0.21 | 223 | 7,014,219 | v5 综合能力候选案例 |

其余来源包括两套 Schema、作者指南、诊断参考、公共合同说明、fallback 着色器与精选实现/测试片段。完整目录会保留纹理、GLSL include、拆分 Manifest、README、UPSTREAM 和已有 License。

导入从固定 commit 的 Git blob 读取，保留混合换行和二进制字节，不沿用 W0 工作树 CRLF 的指纹。根 `.gitattributes` 保留整个快照的原始字节；来源 `.gitattributes` 改为非生效的存档文件名，内容不变。

| 受管身份 | SHA-256 |
| --- | --- |
| 来源清单 | `590e8f64b7a4271e734373d3afd2ec780eef426acb767ba07d0f0b3838b286f7` |
| 工具逐文件清单 | `548c685ff8ccc23283cd6b803a595cc2fed35b2df1444dc0327e1baf847ffb54` |
| 工具 ZIP | `df350f286f76045c346045f353a4e25364b83a9418c50225f12a3e1bf59b4b3a` |
| 作者快照 ZIP | `3afae7e62933c98a52e4942b61327b60263d7ae8d0e4c03defb26fe57f110576` |

## 2. 工具身份

从该 commit 的全新 Git 归档构建 Release 自包含 win-x64 Analyzer，使用源码已有 publish profile，SDK 10.0.301。构建成功；日志有 86 条 warning 行，包含上游源码与 NuGet 审计告警。本阶段未修改宿主源码或依赖。

工具清单包含 278 个文件、106,773,046 字节；ZIP 为 45,926,098 字节。作者快照 ZIP 为 10,113,471 字节。分发身份为 `docs-tools-f8aaa5c4-w1.1`。

固定 ZIP 校验本次构建，不宣称 NuGet 尚未完全锁定的源码重建可以生成同样二进制。重新构建使用新分发 ID；旧资产保持不变。

固定获取地址：[私有工具 Release](https://github.com/EltanceX/DawnlightCore/releases/tag/docs-tools-f8aaa5c4-w1.1)。本地需要源仓库读取权限；未来网站 CI 需要配置 `DAWNLIGHT_ASSETS_TOKEN`。网站远程仓库和 Actions 的实际首次运行留在 W2。

## 3. 原始指南和派生指南

原始 v5 指南继续以精确 Git blob 保存，`docs verify-v5` 退出 1，确认 `DLTOOL2001`。原因仍是说明性 JSON 围栏缺少 `file=` 标记。

网站单独维护 `dawnlight-v5-guide-site-v1`：添加派生身份说明，仅将该说明块的一对反引号围栏改为波浪号围栏。原始七个可重建文件块保持不变。变换脚本记录输入/输出 SHA-256、原始行号和独立身份，验证时重新计算变换。

派生指南通过验证，抽取的七份文件与锁定 `CustomDataLab_Both` 精确匹配。v4 指南同样通过，抽取七份文件与 `SceneAbiLab_v0.1` 精确匹配。两份指南的诊断表均与当前工具匹配。

W0 的失败记录保持原样。W0-01 通过明确的网站变体方案关闭网站工具链阻塞；上游原始指南缺陷仍然存在。

## 4. 验证结果

`validate-upstream.mjs` 在操作系统临时目录启动自包含 EXE，显式使用 vendor 和工具路径。共 19 项检查：18 项成功，1 项确认已知原始指南失败。

| 检查 | 数量 | 结果 |
| --- | ---: | --- |
| 当前 Catalog | 1 | 与冻结合同和已导入字节一致 |
| v3/v4 与 v5 Schema bundle | 2 | 全部 schema/completion/index 长度与哈希一致 |
| 原始 v5 指南 | 1 | 确认预期退出 1 / DLTOOL2001 |
| v4 指南与 v5 网站变体 | 2 | 验证、诊断表、抽取文件字节一致 |
| 生成的诊断表 | 1 | 与导入结果逐字节一致 |
| 四份完整包 Loader 校验 | 4 | valid=true |
| v4/v5 Scene explain | 3 | 合同与 ABI 指纹一致 |
| v5 Graph | 1 | 显式选择输出合同 2 |
| materials explain/layout、data/program interface | 4 | 离线成功；program interface 显式合同 2 |

6 项回归测试全部通过，覆盖修改/缺失/新增文件、收据修改、工具 EXE 修改、确定性 ZIP 与二进制/混合换行往返、Windows 换行克隆、目录替换边界和错误宿主 commit 拒绝。只读验证在执行前后复验快照与工具。

## 5. 获取与恢复

已提供 `acquire-tool.mjs`、`restore-upstream.mjs` 和 `rehearse-toolchain.mjs`。本地压缩包恢复与全新目录的真实远程下载演练均通过。Release ID 为 `422459804`；标签实际指向冻结 commit，两个 ZIP 的 GitHub 资产 digest、长度和本地锁定值一致。

演练只向全新目录复制脚本、metadata、lock 与 `.gitattributes`。初始目录没有 vendor、工具缓存、下载缓存、宿主源码或 node_modules。脚本恢复并核对 ZIP 和完整文件清单，再在外部 cwd 执行同一套 19 项检查。

首次远程演练遇到 GitHub API/GraphQL EOF 而失败。补充最多三次的瞬时网络错误重试后，另建空目录重新下载并完成验收；失败尝试没有记为成功。工具与快照以 SHA-256 固定，不因重试切换版本或跳过检查。

## 6. 阶段边界

- W0-01：采用独立网站指南变体，保留原始缺陷和失败。
- W0-02：固定资产与实际远程恢复完成，已关闭网站工具链阻塞。
- W0-06：Git blob 字节导入、重复导入一致性与 Windows checkout 验证完成，已关闭。
- W0-03：网站仓库、main、Pages 和 CI secret 配置由 W2 完成。
- W0-04：外置教学包与真实场景验收保留 W3/W4。
- W0-05：P11 性能和正式发布证据保持待验收。

所有未提供的证据继续保持 `driverStatus=notProvided`、`mappingStatus=deferred`、`runtimeEvaluated=false`、`liveWorldVerified=false`。本次没有新增驱动报告、游戏截图、运行时材质映射或性能证据。
