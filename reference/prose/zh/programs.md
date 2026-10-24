## 行为与约束 {#behavior}

graphics 提供 vertex/fragment，compute 提供 compute，不能混用阶段文件。id 被 Pass programs 和命令 program 引用；命令使用的 Program 必须属于该 Pass 的可见声明。shaderRoot 内源码、includes、defines、option/capability 输入和编译上下文共同组成冻结闭包，不通过运行时文件变动修改已排队候选。

compileMode 有 legacyCustom、officialCompatible、manifestDriven，默认与限制需结合具体 host/Program 的解析结果，不能把“可填写”当作任意 host 都支持。officialCompatible 使用宿主公开顶点/宏约定；例如 Terrain 要保留语义注释与 OPENGL_POSITION_FIX。包自有 includes 不能跳转到 BuiltIn owner；materials 的宿主虚拟 include 是显式 ABI 入口，不是任意内置路径读取。

defines 接受固定值或 option/capability 映射；variants 以 id 和 defines 表达可选择的编译变体。输出宏值和 null 行为按 Schema/解析器处理，不运行作者代码。源码接口中的 uniform、block、vertex input 和 fragment output 要与 bindings、sceneBindings、targets 和 drawBuffers 一致。

Program 级 bindings/targets/drawBuffers/state/engineDrawState 是对应执行边界的调用描述，command 自有调用信息需在实际解析结果中核对，不能把重复声明当作自动合并所有 owner。静态 reflection 可能缺少编译上下文；有源码闭包仍不等于驱动编译和可执行 generation。
