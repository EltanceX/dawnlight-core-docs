import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import BaselineNote from './components/BaselineNote.vue'
import SourceNote from './components/SourceNote.vue'
import HomeOverview from './components/HomeOverview.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BaselineNote', BaselineNote)
    app.component('SourceNote', SourceNote)
    app.component('HomeOverview', HomeOverview)
  }
} satisfies Theme
