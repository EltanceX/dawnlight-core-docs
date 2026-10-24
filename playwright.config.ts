import { defineConfig } from '@playwright/test'

const deployed = process.env.SITE_URL

export default defineConfig({
  testDir: './tests',
  outputDir: './artifacts/w2/browser',
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: 'artifacts/w2/browser-results.json' }]],
  use: {
    baseURL: deployed ?? 'http://127.0.0.1:4173/dawnlight-core-docs/',
    browserName: 'chromium',
    colorScheme: 'light',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ],
  webServer: deployed ? undefined : {
    command: 'npm run docs:preview -- --port 4173',
    url: 'http://127.0.0.1:4173/dawnlight-core-docs/',
    reuseExistingServer: !process.env.CI
  }
})
