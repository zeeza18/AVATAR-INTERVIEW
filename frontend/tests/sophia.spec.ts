import { test, expect } from '@playwright/test'

test('Sophia avatar loads and renders correctly', async ({ page }) => {
  const consoleLogs: string[] = []
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => consoleLogs.push(`[pageerror] ${err.message}`))

  await page.goto('/interview')

  // Select Sophia
  await page.getByText('Sophia — HR').click()
  await page.getByText('Start Interview').click()

  // Wait for avatar iframe
  await expect(page.locator('iframe')).toBeVisible()

  // Wait for Speak button (avatar ready)
  await expect(page.getByRole('button', { name: 'Speak' })).toBeVisible({ timeout: 30_000 })

  await page.screenshot({ path: 'tests/screenshots/sophia-ready.png', fullPage: true })

  const errors = consoleLogs.filter(l => l.startsWith('[error]') || l.startsWith('[pageerror]'))
  console.log('Errors:', errors)
})
