<script setup lang="ts">
import { withBase } from 'vitepress'
import lock from '../../../../upstream.lock.json'
</script>

<template>
  <aside class="baseline-note" aria-label="本页适用基线">
    <span class="baseline-dot" aria-hidden="true"></span>
    <span>Manifest v{{ lock.authoring.primaryManifestVersion }} · Scene ABI v{{ lock.authoring.sceneAbiVersion }}</span>
    <a :href="withBase('/compatibility/current-baseline')">{{ lock.upstream.commit.slice(0, 8) }} · 静态合同已核对</a>
  </aside>
</template>
