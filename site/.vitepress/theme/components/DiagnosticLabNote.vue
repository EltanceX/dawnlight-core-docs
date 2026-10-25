<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import receipt from '../../../../metadata/w7-diagnostics.json'
const { lang } = useData()
const en = computed(() => lang.value === 'en-US')
</script>
<template>
  <div class="diagnostic-lab">
    <section v-for="item in receipt.cases" :key="item.id" class="custom-block warning">
      <p class="custom-block-title">{{ item.id }} · {{ en ? 'Expected rejection' : '预期拒绝的反例' }}</p>
      <p><a :href="withBase(item.downloadUrl)" download>{{ en ? 'Download intentionally invalid ZIP' : '下载故意无效的完整 ZIP' }}</a></p>
      <p><code>{{ item.archiveSha256 }}</code></p>
      <div v-for="d in item.checks[0].diagnostics" :key="d.pointer">
        <p><strong>{{ d.code }}</strong> · <code>{{ d.file }}</code></p>
        <p><code>{{ d.pointer }}</code></p><p>{{ d.message }}</p>
      </div>
      <p>{{ en ? 'Source + fresh ZIP: pack/graph/interface exit 1. Restored source: all three exit 0.' : '源码 + 新解压 ZIP：pack/graph/interface 均退出 1；恢复原始源码后三项均退出 0。' }}</p>
    </section>
    <p><a :href="withBase('/downloads/examples/w7-diagnostics/recipes.json')">{{ en ? 'Exact edit recipes' : '精确变更配方' }}</a> · <a :href="withBase('/downloads/examples/w7-diagnostics/validation.json')">{{ en ? 'Validation receipt' : '验证收据' }}</a></p>
  </div>
</template>
<style scoped>
code { overflow-wrap: anywhere; white-space: normal; }
</style>
