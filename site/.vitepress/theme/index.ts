import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import BaselineNote from './components/BaselineNote.vue'
import SourceNote from './components/SourceNote.vue'
import HomeOverview from './components/HomeOverview.vue'
import RuntimeNote from './components/RuntimeNote.vue'
import CourseBranchNote from './components/CourseBranchNote.vue'
import PackRuntimeNote from './components/PackRuntimeNote.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BaselineNote', BaselineNote)
    app.component('SourceNote', SourceNote)
    app.component('HomeOverview', HomeOverview)
    app.component('RuntimeNote', RuntimeNote)
    app.component('CourseBranchNote', CourseBranchNote)
    app.component('PackRuntimeNote', PackRuntimeNote)
  }
} satisfies Theme
