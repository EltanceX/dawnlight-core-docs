<script setup lang="ts">
defineProps<{ path: string; label?: string }>()
import lock from '../../../../upstream.lock.json'
import { useData } from 'vitepress'
const { lang } = useData()
const commit = lock.upstream.commit
</script>

<template>
  <p class="source-note">{{ lang === 'en-US' ? 'Source: ' : '来源：' }}<a :href="`https://gitea.com/EltanceX/DawnlightCore/src/commit/${commit}/${path}`" target="_blank" rel="noreferrer">{{ label ?? path }}</a> <span>· {{ commit.slice(0, 8) }}</span></p>
</template>
