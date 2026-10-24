<script setup lang="ts">
defineProps<{ path: string; label?: string }>()
import lock from '../../../../upstream.lock.json'
const commit = lock.upstream.commit
</script>

<template>
  <p class="source-note">来源：<a :href="`https://gitea.com/EltanceX/DawnlightCore/src/commit/${commit}/${path}`" target="_blank" rel="noreferrer">{{ label ?? path }}</a> <span>· {{ commit.slice(0, 8) }}</span></p>
</template>
