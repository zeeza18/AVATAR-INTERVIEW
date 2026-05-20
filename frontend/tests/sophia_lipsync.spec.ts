import { test, expect } from '@playwright/test'

test('Sophia lip sync — final visual check', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/interview')
  await page.getByText('Sophia — HR').click()
  await page.getByText('Start Interview').click()

  await expect(page.getByRole('button', { name: 'Speak' })).toBeVisible({ timeout: 30_000 })

  const getAvatarFrame = () => page.frames().find(f => f.url().includes('avatar.html'))

  // Idle crop — mouth closed baseline
  await page.screenshot({ path: 'tests/screenshots/final-idle.png', clip: { x: 480, y: 270, width: 320, height: 230 } })

  await page.getByRole('button', { name: 'Speak' }).click()
  await expect(page.getByRole('button', { name: 'Speaking…' })).toBeVisible({ timeout: 10_000 })

  // Wait for jaw peak
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(100)
    const jaw = await getAvatarFrame()?.evaluate(() => (window as any).__getJaw?.() ?? 0) ?? 0
    if ((jaw as number) > 0.5) break
  }

  // Speaking crop — mouth open
  await page.screenshot({ path: 'tests/screenshots/final-speaking.png', clip: { x: 480, y: 270, width: 320, height: 230 } })

  // Full frames for context
  await page.screenshot({ path: 'tests/screenshots/final-full-speaking.png' })

  await expect(page.getByRole('button', { name: 'Speak' })).toBeVisible({ timeout: 20_000 })
})
