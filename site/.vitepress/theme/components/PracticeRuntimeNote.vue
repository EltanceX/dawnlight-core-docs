<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import evidence from '../../../../metadata/w7-runtime.json'
const props = defineProps<{ example: string }>()
const { lang } = useData()
const en = computed(() => lang.value === 'en-US')
const item = computed(() => evidence.examples.find(e => e.id === props.example))
</script>
<template>
  <div v-if="item" class="practice-runtime custom-block tip">
    <p class="custom-block-title">{{ en ? 'Actual game observations · W7' : '实际游戏观察 · W7' }} · {{ item.id }}</p>
    <p>{{ en ? 'Three option branches, same-pack reload, actual window resize and return to BuiltIn passed. Linked Programs match the static active closure and framebuffers are complete. This covers one Windows device/world/main view, with no performance or numeric readback claim.' : '三个选项分支、同包重载、真实窗口尺寸变化及返回 BuiltIn 通过。链接 Program 与静态活动闭包一致，帧缓冲完整。范围为一台 Windows 设备、一个世界和单主 view，不提供性能或数值读回结论。' }}</p>
    <p><code>{{ item.sourceFingerprint }}</code></p>
    <p><a :href="withBase(item.lifecycle)">{{ en ? 'Branch and lifecycle summary' : '分支与生命周期摘要' }}</a></p>
    <img :src="withBase(item.image)" :alt="en ? 'Actual isolated game window with this effect enabled' : '隔离游戏中开启本效果的实际窗口'" width="1280" height="763" loading="lazy" />
  </div>
</template>
<style scoped>
code { overflow-wrap: anywhere; white-space: normal; }
</style>
