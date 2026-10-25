<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import cases from '../../../../metadata/w7-case-studies.json'
const props = defineProps<{ id: string }>()
const { lang } = useData()
const en = computed(() => lang.value === 'en-US')
const item = computed(() => cases.cases.find(c => c.id === props.id))
</script>

<template>
  <div v-if="item" class="case-study">
    <p><strong>Manifest v{{ item.manifestVersion }}</strong> · {{ en ? 'Selected declared relationships; options may deactivate passes.' : '选定声明关系；选项可能停用其中的 Pass。' }}</p>
    <section v-for="file in item.files.filter(f => f.passes.length)" :key="file.path" class="case-file">
      <h4><a :href="file.sourceUrl">{{ file.path }}</a></h4>
      <div v-for="pass in file.passes" :key="pass.id" class="case-flow" role="group" :aria-label="pass.id">
        <div class="flow-resources"><small>{{ en ? 'Reads' : '读取' }}</small><code v-for="id in pass.inputs" :key="id">{{ id }}</code><span v-if="!pass.inputs.length">∅</span></div>
        <span class="flow-arrow" aria-hidden="true">→</span>
        <div class="flow-pass"><strong>{{ pass.id }}</strong><small v-if="pass.enabledWhen.length">{{ en ? 'Conditional' : '有条件启用' }}: <code>{{ JSON.stringify(pass.enabledWhen) }}</code></small><small v-for="(c, i) in pass.commands" :key="i">{{ i + 1 }}. {{ c.type }} <code>{{ c.program || c.resource || '' }}</code></small></div>
        <span class="flow-arrow" aria-hidden="true">→</span>
        <div class="flow-resources"><small>{{ en ? 'Writes' : '写入' }}</small><code v-for="id in pass.outputs" :key="id">{{ id }}</code><span v-if="!pass.outputs.length">∅</span></div>
      </div>
      <details><summary>{{ en ? 'Source identity' : '来源身份' }}</summary><p>{{ file.length }} bytes · SHA-256 <code>{{ file.sha256 }}</code></p></details>
    </section>
  </div>
</template>

<style scoped>
.case-study { margin: 24px 0; }
.case-file { padding: 16px; margin: 16px 0; border: 1px solid var(--vp-c-divider); border-radius: 12px; }
.case-flow { display: grid; grid-template-columns: minmax(0,1fr) 18px minmax(0,1.3fr) 18px minmax(0,1fr); align-items: center; gap: 6px; margin: 16px 0; font-size: 12px; line-height: 1.6; }
.flow-resources, .flow-pass { display: flex; flex-direction: column; min-width: 0; gap: 6px; }
.flow-pass { background: var(--vp-c-brand-soft); border: 1px solid var(--vp-c-brand-3); border-radius: 8px; padding: 10px; }
.case-study code, .case-study strong { white-space: normal; overflow-wrap: anywhere; }
.flow-arrow { text-align: center; color: var(--vp-c-brand-1); }
small { display: block; }
details { font-size: 12px; }
@media (max-width: 600px) {
  .case-flow { grid-template-columns: minmax(0,1fr); }
  .flow-arrow { transform: rotate(90deg); }
}
</style>
