## 行为与约束 {#behavior}

option 的 id/type/default/impact 是权威定义；name/description 只用于展示。类型为 boolean、integer、number、string，default 与 override 必须同类型并满足 min/max 或 allowed。JSON boolean 不是整数；字符串枚举值区分大小写。范围和 allowed 的支持组合见完整 Schema，不把省略的 min/max 推断成零。

impact 为 uniform、program、pipeline、resources，声明改动会影响哪一层重建。它不是“永远免重编译”的承诺：数据、defines、资源及活动分支依赖仍需验证。UI 不能再次定义类型、硬范围、默认值或 impact。

Pass 的 enabled 是显式开关；enabledWhen、资源 binding/semantic/service 条件等使用 option 加 equals 或 oneOf。每个条件值先通过被引用 option 的类型及范围校验，条件数组共同约束活动性。设置 UI 使用不同的 equals/notEquals/in 条件合同，不应混写。

离线图需要指定与目标运行一致的 options/capabilities。关闭 Pass 后检查活动的 Program、Resource、Service 与前后依赖闭包，不能只看声明节点仍在图中就断言它仍分配。未满足依赖或非法条件在加载/解析阶段失败；不会靠执行时跳过来掩盖错误。
