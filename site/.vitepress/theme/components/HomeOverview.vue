<script setup lang="ts">
import { withBase } from 'vitepress'
</script>

<template>
  <section class="home-overview" aria-labelledby="reading-title">
    <div class="home-reading">
      <p class="eyebrow">AUTHOR'S FIELD GUIDE</p>
      <h2 id="reading-title">先看懂一帧，再写出自己的光影。</h2>
      <p>从资源与执行关系开始，逐步理解 JSON 如何连接 GLSL 与宿主。这里的解释始终对应一个可核对的源码基线。</p>
      <a class="reading-step" :href="withBase('/start/')"><span>01</span><div><strong>找到阅读路线</strong><small>前置知识、文档范围与学习顺序</small></div><b aria-hidden="true">↗</b></a>
      <a class="reading-step" :href="withBase('/concepts/pipeline')"><span>02</span><div><strong>建立管线模型</strong><small>Phase、Pass、Command、Program、Resource</small></div><b aria-hidden="true">↗</b></a>
      <a class="reading-step" :href="withBase('/tools/analyzer')"><span>03</span><div><strong>读懂验证结果</strong><small>配置合法、离线语义与实际运行证据</small></div><b aria-hidden="true">↗</b></a>
    </div>
    <aside class="home-scope">
      <p class="eyebrow">CURRENT EDITION</p>
      <h3>围绕 Manifest v5 编写</h3>
      <dl><div><dt>场景接口</dt><dd>Scene ABI v2</dd></div><div><dt>来源基线</dt><dd><code>f8aaa5c4</code></dd></div><div><dt>首版运行范围</dt><dd>Windows x64 · 单主 view</dd></div><div><dt>当前文档</dt><dd>阅读路线、核心概念与工具说明</dd></div></dl>
      <p>连续教程和示例下载将在后续阶段逐章补齐。导航只收录当前可以完整阅读的页面。</p>
      <a :href="withBase('/compatibility/current-baseline')">查看版本与验证范围 →</a>
    </aside>
  </section>
</template>
