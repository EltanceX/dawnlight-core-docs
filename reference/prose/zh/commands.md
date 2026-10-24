## 行为与约束 {#behavior}

以下词表属于 command_list@1；命令按数组顺序执行。完整结构包含各 type 的条件 required/forbidden 字段，不能把通用 command 对象的全部可选字段同时填入每种命令。

| type | Program 与关键行为 |
| --- | --- |
| fullscreen | 必需 graphics Program；绘制到 named targets |
| present | 必需 graphics Program；输出到默认 framebuffer，不用它冒充任意 MRT 写入 |
| compute | 必需 compute Program；dispatch.groups 为三维工作组数，barriers 是声明的 memory barrier 集合 |
| engineDraw | provider/id/version 调用可信宿主绘制；Program 可选，Scene 路径还受 sceneProvider 与类别合同约束 |
| copy | 禁止 Program；source/destination、aspects、filter、restore 表达 framebuffer transfer |
| clear | 禁止 Program；对命名目标或适用默认 framebuffer 清理；附件格式必须匹配 clear 值 |
| historyCommit | 禁止 Program；resource 必须是 history，标记当前帧完成，不是假造资源读写 |

copy 首版只接受一个 direct texture2D color 或 depth aspect，源/目标格式完全一致；深度只用 nearest，不支持 history view、stencil 或 combined aspects。每条 history 每帧最多 commit 一次，必须存在同帧 writer，所有 writer 在 commit 前有序；无 writer、重复、后置/无序 writer 都应拒绝。

engineDraw 使用 graphics Program 时，Program、bindings/semantics/targets/state 属于调用描述，Provider 保留可信几何提交与动态输入。BuiltIn fallback 是声明式 recipe：不能向它塞入包自有 Program、bindings、semantics 或 drawBuffers。viewport 的 source/restore/synchronizeScissor 和 state 恢复也属于实际执行边界，失败不能留下半套 GL 状态。
