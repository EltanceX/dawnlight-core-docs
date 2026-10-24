<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import lock from '../../../../upstream.lock.json'
const { lang } = useData()
</script>

<template>
  <aside class="baseline-note" :aria-label="lang === 'en-US' ? 'Baseline for this page' : '本页适用基线'">
    <span class="baseline-dot" aria-hidden="true"></span>
    <span>Manifest v{{ lock.authoring.primaryManifestVersion }} · Scene ABI v{{ lock.authoring.sceneAbiVersion }}</span>
    <a :href="withBase((lang === 'en-US' ? '/en' : '') + '/compatibility/current-baseline')">{{ lock.upstream.commit.slice(0, 8) }} · {{ lang === 'en-US' ? 'Static contracts checked' : '静态合同已核对' }}</a>
  </aside>
</template>
