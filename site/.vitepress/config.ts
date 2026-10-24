import { defineConfig } from 'vitepress'
import lock from '../../upstream.lock.json'

const base = '/dawnlight-core-docs/'

export default defineConfig({
  lang: 'zh-CN',
  title: 'DawnlightCore',
  description: 'Survivalcraft DawnlightCore 光影包开发文档：理解渲染管线、JSON 数据驱动与公共着色器合同。',
  base,
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: 'https://eltancex.github.io/dawnlight-core-docs/' },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
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
    outline: { level: [2, 3], label: '本页内容' },
    nav: [
      { text: '开始阅读', link: '/start/' },
      { text: '管线概念', link: '/concepts/pipeline' },
      { text: '当前基线', link: '/compatibility/current-baseline' },
      { text: '上游源码 ↗', link: 'https://gitea.com/EltanceX/DawnlightCore' }
    ],
    sidebar: [
      { text: '开始使用', items: [
        { text: '阅读路线', link: '/start/' },
        { text: '版本与支持范围', link: '/compatibility/current-baseline' }
      ] },
      { text: '理解管线', items: [
        { text: '从配置到一帧画面', link: '/concepts/pipeline' },
        { text: '资源、目标与 drawBuffers', link: '/concepts/resources-targets' }
      ] },
      { text: '验证与排错', items: [
        { text: 'Analyzer 与证据边界', link: '/tools/analyzer' }
      ] }
    ],
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
        miniSearch: {
          options: {
            // Preserve API identifiers; Chinese bigrams allow substring recall.
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
    socialLinks: [{ icon: 'github', link: 'https://github.com/EltanceX/dawnlight-core-docs' }],
    editLink: { pattern: 'https://github.com/EltanceX/dawnlight-core-docs/edit/main/site/:path', text: '在 GitHub 编辑本页' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'medium' } },
    darkModeSwitchLabel: '切换主题', lightModeSwitchTitle: '切换到浅色', darkModeSwitchTitle: '切换到深色',
    sidebarMenuLabel: '目录', returnToTopLabel: '返回顶部',
    notFound: { code: '404', title: '页面未找到', quote: '链接可能已变更。可以返回首页，或搜索字段与概念。', linkLabel: '返回文档首页', linkText: '返回文档首页' },
    footer: { message: `作者文档 · Manifest v${lock.authoring.primaryManifestVersion} / Scene ABI v${lock.authoring.sceneAbiVersion}`, copyright: 'DawnlightCore · Survivalcraft' }
  }
})
