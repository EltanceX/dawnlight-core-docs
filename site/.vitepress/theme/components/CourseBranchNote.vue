<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import evidence from '../../../../metadata/w6-examples-validation.json'
const props = defineProps<{ example: string }>()
const { lang } = useData()
const en = computed(() => lang.value === 'en-US')
const item = computed(() => evidence.examples.find(e => e.id === props.example))
</script>

<template>
  <div class="course-branches">
    <p>{{ en ? 'Source and freshly extracted ZIP agree for every row. Counts include only active nodes; resources include the material buffer where present.' : '每行均已对照源码与新解压 ZIP。数量只统计活动节点；资源数包含存在的材质 buffer。' }}</p>
    <table>
      <thead><tr><th>{{ en ? 'Variant' : '分支' }}</th><th>{{ en ? 'Overrides' : '覆盖值' }}</th><th>{{ en ? 'Resources' : '资源' }}</th><th>{{ en ? 'Commands' : '命令' }}</th></tr></thead>
      <tbody><tr v-for="branch in item?.branches" :key="branch.id">
        <td><code>{{ branch.id }}</code></td>
        <td><code>{{ JSON.stringify(branch.options) }}</code></td>
        <td>{{ branch.activeResources.length }}</td><td>{{ branch.activeCommands.length }}</td>
      </tr></tbody>
    </table>
    <details><summary>{{ en ? 'Exact active closure' : '精确活动闭包' }}</summary>
      <div v-for="branch in item?.branches" :key="branch.id">
        <p><strong>{{ branch.id }}</strong></p>
        <p><code>{{ branch.activeResources.join(', ') }}</code></p>
        <p><code>{{ branch.activeCommands.join(', ') }}</code></p>
        <p><code>{{ branch.activePrograms.join(', ') }}</code></p>
        <p>{{ en ? 'Active services' : '活动 services' }}: {{ branch.activeServices.length }}</p>
      </div>
    </details>
  </div>
</template>

<style scoped>
code { overflow-wrap: anywhere; white-space: normal; }
</style>
