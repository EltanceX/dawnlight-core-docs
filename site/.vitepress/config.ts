import { defineConfig, type DefaultTheme } from 'vitepress'
import lock from '../../upstream.lock.json'
import reference from '../../reference/pages.json'

const base = lock.website.pagesBase
const siteUrl = lock.website.pagesUrl
const source = 'https://gitea.com/EltanceX/DawnlightCore'

const chinese: DefaultTheme.Config = {
  outline: { level: [2, 3], label: '本页内容' },
  nav: [
    { text: '开始阅读', link: '/start/' },
    { text: 'JSON / ABI 参考', link: '/reference/' },
    { text: '当前基线', link: '/compatibility/current-baseline' },
    { text: '示例与下载', link: '/examples/' },
    { text: '上游源码', link: source }
  ],
  sidebar: [
    { text: '开始使用', items: [
      { text: '阅读路线', link: '/start/' },
      { text: '环境准备与加载', link: '/start/environment' },
      { text: 'GLSL 基础', link: '/start/glsl' },
      { text: '示例与下载', link: '/examples/' },
      { text: '00 · 外置起步包', link: '/examples/course-starter' },
      { text: '版本与支持范围', link: '/compatibility/current-baseline' }
    ] },
    { text: '入门到场景接入', items: [
      { text: '00 · 加载起步包', link: '/tutorial/00-starter' },
      { text: '01 · 第一个后处理', link: '/tutorial/01-first-post' },
      { text: '02 · 后处理资源', link: '/tutorial/02-resources' },
      { text: '03 · opaque Terrain', link: '/tutorial/03-scene' },
      { text: '04 · MRT 数据', link: '/tutorial/04-mrt' },
      { text: '实机验证记录', link: '/tutorial/runtime' }
    ] },
    { text: '制作独立光影包', items: [
      { text: '05 · 可选效果与设置', link: '/tutorial/05-options' },
      { text: '06 · 时间、天气与数据', link: '/tutorial/06-custom-data' },
      { text: '07 · 稳定内容与材质', link: '/tutorial/07-materials' },
      { text: '08 · 后处理链与成本', link: '/tutorial/08-post-chain' },
      { text: '09 · 完整琥珀光影包', link: '/tutorial/09-complete-pack' },
      { text: '10 · 验证与分发', link: '/tutorial/10-distribution' },
      { text: '光影包实机记录', link: '/tutorial/pack-runtime' }
    ] },
    { text: 'JSON 与 ABI 参考', collapsed: true, items: reference.pages.map(page => ({
      text: page.titles['zh-CN'], link: '/reference/' + (page.id === 'index' ? '' : page.id)
    })) },
    { text: '理解管线', items: [
      { text: '从配置到一帧画面', link: '/concepts/pipeline' },
      { text: '资源、目标与 drawBuffers', link: '/concepts/resources-targets' }
    ] },
    { text: '验证与排错', items: [
      { text: 'Analyzer 与证据边界', link: '/tools/analyzer' }
    ] }
  ],
  editLink: { pattern: 'https://github.com/EltanceX/dawnlight-core-docs/edit/main/site/:path', text: '在 GitHub 编辑本页' },
  docFooter: { prev: '上一篇', next: '下一篇' },
  lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'medium' } },
  langMenuLabel: '切换语言', skipToContentLabel: '跳转到正文',
  darkModeSwitchLabel: '切换主题', lightModeSwitchTitle: '切换到浅色', darkModeSwitchTitle: '切换到深色',
  sidebarMenuLabel: '目录', returnToTopLabel: '返回顶部',
  notFound: { code: '404', title: '页面未找到', quote: '链接可能已变更。可以返回首页，或搜索字段与概念。', linkLabel: '返回文档首页', linkText: '返回文档首页' },
  footer: { message: '作者文档 · Manifest v' + lock.authoring.primaryManifestVersion + ' / Scene ABI v' + lock.authoring.sceneAbiVersion, copyright: 'DawnlightCore · Survivalcraft' }
}

const english: DefaultTheme.Config = {
  outline: { level: [2, 3], label: 'On this page' },
  nav: [
    { text: 'Get started', link: '/en/start/' },
    { text: 'JSON / ABI reference', link: '/en/reference/' },
    { text: 'Current baseline', link: '/en/compatibility/current-baseline' },
    { text: 'Examples', link: '/en/examples/' },
    { text: 'Upstream source', link: source }
  ],
  sidebar: [
    { text: 'Getting started', items: [
      { text: 'Reading guide', link: '/en/start/' },
      { text: 'Environment and loading', link: '/en/start/environment' },
      { text: 'GLSL essentials', link: '/en/start/glsl' },
      { text: 'Examples and downloads', link: '/en/examples/' },
      { text: '00 · External starter', link: '/en/examples/course-starter' },
      { text: 'Versions and support', link: '/en/compatibility/current-baseline' }
    ] },
    { text: 'From starter to scene', items: [
      { text: '00 · Load the starter', link: '/en/tutorial/00-starter' },
      { text: '01 · First post-process', link: '/en/tutorial/01-first-post' },
      { text: '02 · Post-process resource', link: '/en/tutorial/02-resources' },
      { text: '03 · Opaque Terrain', link: '/en/tutorial/03-scene' },
      { text: '04 · MRT data', link: '/en/tutorial/04-mrt' },
      { text: 'Runtime observations', link: '/en/tutorial/runtime' }
    ] },
    { text: 'Build an independent pack', items: [
      { text: '05 · Options and settings', link: '/en/tutorial/05-options' },
      { text: '06 · Time, weather and data', link: '/en/tutorial/06-custom-data' },
      { text: '07 · Stable content and materials', link: '/en/tutorial/07-materials' },
      { text: '08 · Post chain and cost', link: '/en/tutorial/08-post-chain' },
      { text: '09 · Complete Amber pack', link: '/en/tutorial/09-complete-pack' },
      { text: '10 · Verify and distribute', link: '/en/tutorial/10-distribution' },
      { text: 'Pack runtime observations', link: '/en/tutorial/pack-runtime' }
    ] },
    { text: 'JSON and ABI reference', collapsed: true, items: reference.pages.map(page => ({
      text: page.titles['en-US'], link: '/en/reference/' + (page.id === 'index' ? '' : page.id)
    })) },
    { text: 'Understanding the pipeline', items: [
      { text: 'From configuration to a frame', link: '/en/concepts/pipeline' },
      { text: 'Resources, targets and drawBuffers', link: '/en/concepts/resources-targets' }
    ] },
    { text: 'Validation and troubleshooting', items: [
      { text: 'Analyzer and evidence', link: '/en/tools/analyzer' }
    ] }
  ],
  editLink: { pattern: 'https://github.com/EltanceX/dawnlight-core-docs/edit/main/site/:path', text: 'Edit this page on GitHub' },
  docFooter: { prev: 'Previous page', next: 'Next page' },
  lastUpdated: { text: 'Last updated', formatOptions: { dateStyle: 'medium' } },
  langMenuLabel: 'Change language', skipToContentLabel: 'Skip to content',
  darkModeSwitchLabel: 'Appearance', lightModeSwitchTitle: 'Switch to light theme', darkModeSwitchTitle: 'Switch to dark theme',
  sidebarMenuLabel: 'Menu', returnToTopLabel: 'Back to top',
  notFound: { code: '404', title: 'Page not found', quote: 'The link may have changed. Return home or search for a field or concept.', linkLabel: 'Back to documentation', linkText: 'Back to documentation' },
  footer: { message: 'Author documentation · Manifest v' + lock.authoring.primaryManifestVersion + ' / Scene ABI v' + lock.authoring.sceneAbiVersion, copyright: 'DawnlightCore · Survivalcraft' }
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'DawnlightCore',
  description: 'Survivalcraft DawnlightCore 光影包开发文档：理解渲染管线、JSON 数据驱动与公共着色器合同。',
  base,
  cleanUrls: true,
  srcExclude: ['public/**'],
  lastUpdated: true,
  locales: {
    root: { label: '简体中文', lang: 'zh-CN', themeConfig: chinese },
    en: {
      label: 'English', lang: 'en-US',
      description: 'Shader pack author documentation for Survivalcraft DawnlightCore: rendering pipelines, JSON configuration and public shader contracts.',
      themeConfig: english
    }
  },
  sitemap: {
    hostname: siteUrl,
    transformItems: items => items.filter(item => !/(^|\/)404$/.test(item.url))
  },
  transformPageData: pageData => {
    const head = pageData.frontmatter.head ??= []
    if (/(^|\/)404\.md$/.test(pageData.relativePath)) {
      return
    }
    const route = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
    const chineseRoute = route.replace(/^en\//, '')
    const canonical = new URL(route, siteUrl).href
    head.push(
      ['link', { rel: 'canonical', href: canonical }],
      ['link', { rel: 'alternate', hreflang: 'zh-CN', href: new URL(chineseRoute, siteUrl).href }],
      ['link', { rel: 'alternate', hreflang: 'en-US', href: new URL('en/' + chineseRoute, siteUrl).href }],
      ['meta', { property: 'og:url', content: canonical }]
    )
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: base + 'favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#23634f' }],
    ['meta', { property: 'og:type', content: 'website' }]
  ],
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    lineNumbers: true
  },
  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: 'DawnlightCore',
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详细结果', resetButtonTitle: '清空搜索',
            backButtonTitle: '返回', noResultsText: '没有找到相关内容',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        },
        locales: {
          en: {
            translations: {
              button: { buttonText: 'Search docs', buttonAriaLabel: 'Search docs' },
              modal: {
                displayDetails: 'Display detailed results', resetButtonTitle: 'Clear search',
                backButtonTitle: 'Back', noResultsText: 'No results found',
                footer: { selectText: 'select', navigateText: 'navigate', closeText: 'close' }
              }
            }
          }
        },
        miniSearch: {
          options: {
            // Keep identifiers intact and add Chinese bigrams for substring recall.
            tokenize: (text: string) => {
              const tokens = text.match(/[\p{Script=Han}]+|[A-Za-z0-9_:@./-]+/gu) ?? []
              const result: string[] = []
              for (const token of tokens) {
                result.push(token)
                if (/\p{Script=Han}/u.test(token)) {
                  const chars = Array.from(token)
                  for (let i = 0; i < chars.length - 1; i++) result.push(chars[i] + chars[i + 1])
                }
              }
              return Array.from(new Set(result))
            }
          },
          searchOptions: { prefix: true, fuzzy: false, boost: { title: 4, titles: 2 } }
        }
      }
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/EltanceX/dawnlight-core-docs' }]
  }
})
