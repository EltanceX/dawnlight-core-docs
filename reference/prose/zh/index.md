## 如何使用参考 {#behavior}

本参考针对锁定宿主 f8aaa5c4。主线是 Manifest v5、Scene ABI v2、Materials / Custom Data ABI v1。结构表从固定 Schema 生成；行为说明由 Loader、公开合同和示例复核。结构校验、离线语义、驱动编译、游戏画面和性能是不同证据，参考页不扩大 W4 的有限实机结论。

| 要解决的问题 | 参考 |
| --- | --- |
| 根字段、路径、组合及身份 | [Manifest](./manifest) |
| 选项类型与活动闭包 | [Options](./options) |
| 纹理、buffer、content、history | [Resources](./resources) |
| GLSL、编译模式与 defines | [Programs](./programs) |
| host、Stage、执行关系与 Services | [Passes](./passes) |
| 七种执行命令 | [Commands](./commands) |
| 附件、drawBuffers 与渲染状态 | [Targets](./targets) |
| 资源绑定、系统语义与比较采样 | [Bindings](./bindings) |
| Terrain、顶点与 frameTarget | [Scene ABI](./scene) |
| 内容身份与材质表 | [Materials](./materials) |
| typed expression、输入与上传 | [Custom data](./custom-data) |
| 菜单、翻译与 option 覆盖 | [Settings UI](./settings-ui) |
| 公共 ID/version、空间与预算 | [Catalog](./catalog) |
| 诊断、CLI、协议与身份 | [Diagnostics](./diagnostics) / [Tool contracts](./tool-contracts) |
| v3/v4 的独立结构与版本门 | [Compatibility](./manifest-versions) |
| 可核对的完整上游源文件 | [Examples](./examples) |

字段清单记录每个 Schema 属性出现位置及所属页面，也覆盖设置 UI 的七类 Loader 白名单对象。它证明结构没有遗漏，不以字段数量代替行为解释。未知字段、新定义或过期输入会使生成检查失败。
