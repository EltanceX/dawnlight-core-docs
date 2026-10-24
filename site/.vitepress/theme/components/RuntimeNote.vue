<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import evidence from '../../../../metadata/w4-runtime.json'
const props = defineProps<{ example: string }>()
const { lang } = useData()
const en = computed(() => lang.value === 'en-US')
const item = computed(() => evidence.examples.find(item => item.id === props.example))
</script>

<template>
  <div class="runtime-note custom-block tip">
    <p class="custom-block-title">{{ en ? 'Actual game observations' : '实际游戏观察' }}</p>
    <template v-if="item">
      <p>{{ en ? item.summary.en : item.summary.zh }}</p>
      <p><code>{{ item.sourceFingerprint }}</code></p>
      <p><a :href="withBase(item.driverReport)">{{ en ? 'Matched driver report' : '已匹配的驱动报告' }}</a> · <a :href="withBase(item.lifecycle)">{{ en ? 'Lifecycle observations' : '生命周期观察' }}</a></p>
      <img v-if="item.image" :src="withBase(item.image)" :alt="en ? item.caption.en : item.caption.zh" loading="lazy" width="1280" height="720" />
    </template>
    <p v-else>{{ en ? 'Runtime verification is in progress; no game result is claimed here yet.' : '实机验收进行中，尚不在此声明游戏验证成功。' }}</p>
    <p><a :href="withBase((en ? '/en' : '') + '/tutorial/runtime')">{{ en ? 'Test host, method and limits →' : '测试宿主、方法与限制 →' }}</a></p>
  </div>
</template>
