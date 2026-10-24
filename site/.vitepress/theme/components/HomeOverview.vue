<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import lock from '../../../../upstream.lock.json'

const { lang } = useData()
const prefix = computed(() => lang.value === 'en-US' ? '/en' : '')
const copy = computed(() => lang.value === 'en-US' ? {
  title: 'Understand a frame. Build your own look.',
  introduction: 'Start with resources and execution order, then learn how JSON connects GLSL to the host. Every explanation refers to a source baseline you can verify.',
  steps: [
    ['Find your reading path', 'Prerequisites, scope and learning order', '/start/'],
    ['Load your first pack', 'Five complete chapters: color, resources, Terrain and MRT', '/tutorial/00-starter'],
    ['Look up JSON and ABI contracts', 'Fields, public IDs, version gates and complete examples', '/reference/'],
    ['Understand validation results', 'Configuration, offline semantics and runtime evidence', '/tools/analyzer']
  ],
  edition: 'Written for Manifest v5',
  facts: [['Scene interface', 'Scene ABI v2'], ['Source baseline', lock.upstream.commit.slice(0, 8)], ['Initial runtime scope', 'Windows x64 · single main view'], ['Available documentation', 'Course 00–10, JSON and ABI reference']],
  scope: 'Follow chapters 00–10 with complete snapshots. Each chapter separates static receipts from actual game observations.',
  baseline: 'View versions and verification scope →'
} : {
  title: '先看懂一帧，再写出自己的光影。',
  introduction: '从资源与执行关系开始，逐步理解 JSON 如何连接 GLSL 与宿主。这里的解释始终对应一个可核对的源码基线。',
  steps: [
    ['找到阅读路线', '前置知识、文档范围与学习顺序', '/start/'],
    ['加载第一个光影包', '五个完整章节：调色、资源、Terrain 与 MRT', '/tutorial/00-starter'],
    ['查阅 JSON 与 ABI 合同', '字段、公共 ID、版本门与完整示例', '/reference/'],
    ['读懂验证结果', '配置合法、离线语义与实际运行证据', '/tools/analyzer']
  ],
  edition: '围绕 Manifest v5 编写',
  facts: [['场景接口', 'Scene ABI v2'], ['来源基线', lock.upstream.commit.slice(0, 8)], ['首版运行范围', 'Windows x64 · 单主 view'], ['当前文档', '第 00～10 章、JSON 与 ABI 参考']],
  scope: '沿第 00～10 章使用独立快照实践；各章分别说明静态收据与实际游戏观察。',
  baseline: '查看版本与验证范围 →'
})
</script>

<template>
  <section class="home-overview" aria-labelledby="reading-title">
    <div class="home-reading">
      <p class="eyebrow">AUTHOR'S FIELD GUIDE</p>
      <h2 id="reading-title">{{ copy.title }}</h2>
      <p>{{ copy.introduction }}</p>
      <a v-for="(step, i) in copy.steps" :key="step[2]" class="reading-step" :href="withBase(prefix + step[2])"><span>0{{ i + 1 }}</span><div><strong>{{ step[0] }}</strong><small>{{ step[1] }}</small></div><b aria-hidden="true">↗</b></a>
    </div>
    <aside class="home-scope">
      <p class="eyebrow">CURRENT EDITION</p>
      <h3>{{ copy.edition }}</h3>
      <dl><div v-for="(fact, i) in copy.facts" :key="i"><dt>{{ fact[0] }}</dt><dd><code v-if="i === 1">{{ fact[1] }}</code><template v-else>{{ fact[1] }}</template></dd></div></dl>
      <p>{{ copy.scope }}</p>
      <a :href="withBase(prefix + '/compatibility/current-baseline')">{{ copy.baseline }}</a>
    </aside>
  </section>
</template>
