<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import evidence from '../../../../metadata/w6-runtime.json'
const props = defineProps<{ example?: string, reader?: boolean }>()
const { lang } = useData()
const en = computed(() => lang.value === 'en-US')
const item = computed(() => evidence.examples.find(e => e.id === props.example))
</script>

<template>
  <div class="pack-runtime-note custom-block tip">
    <p class="custom-block-title">{{ en ? 'Actual game observations · W6' : '实际游戏观察 · W6' }}</p>
    <template v-if="reader">
      <p>{{ en ? 'The final ZIP was extracted into a fresh directory. Balanced/economy/neutral recipes, a saved shader edit and restoration, reload, resize and return to BuiltIn passed. This is an agent proxy, not an independent human trial.' : '最终 ZIP 已解压到新目录，完成 balanced/economy/neutral 配方、保存 shader 修改并还原、重载、调整尺寸与切回 BuiltIn。这是代理复现，尚无独立人类试读结论。' }}</p>
      <p><a :href="withBase(evidence.readerReproduction)">{{ en ? 'Fresh ZIP reproduction record' : '新 ZIP 复现记录' }}</a></p>
    </template>
    <template v-else-if="item">
      <p>{{ en ? item.summary.en : item.summary.zh }}</p>
      <p><code>{{ item.sourceFingerprint }}</code></p>
      <p><a :href="withBase(item.lifecycle)">{{ en ? 'Branch and lifecycle evidence summary' : '分支与生命周期证据摘要' }}</a></p>
      <img :src="withBase(item.image)" :alt="en ? item.caption.en : item.caption.zh" loading="lazy" width="1280" height="764" />
    </template>
    <p><a :href="withBase((en ? '/en' : '') + '/tutorial/pack-runtime')">{{ en ? 'Host, method and unverified scopes →' : '宿主、方法与未验证范围 →' }}</a></p>
  </div>
</template>

<style scoped>
code { overflow-wrap: anywhere; white-space: normal; }
</style>
