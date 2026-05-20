import { test, expect } from '@playwright/test'

test('read bone rotations', async ({ page }) => {
  await page.goto('/interview')
  await page.getByText('Sophia — HR').click()
  await page.getByText('Start Interview').click()
  // wait for avatar fully ready
  await expect(page.getByRole('button', { name: 'Speak' })).toBeVisible({ timeout: 30_000 })
  await page.waitForTimeout(5000)  // let idle animation settle

  const getFrame = () => page.frames().find(f => f.url().includes('avatar.html'))

  // wait until handles are defined
  await page.waitForTimeout(2000)

  const neck  = await getFrame()?.evaluate(() => (window as any).__getNeckRot?.()) ?? 'FRAME_NOT_FOUND'
  const head  = await getFrame()?.evaluate(() => (window as any).__getHeadRot?.()) ?? 'FRAME_NOT_FOUND'
  const root  = await getFrame()?.evaluate(() => (window as any).__getRootRot?.()) ?? 'FRAME_NOT_FOUND'
  const spine = await getFrame()?.evaluate(() => (window as any).__getSpineRot?.()) ?? 'FRAME_NOT_FOUND'
  const hips  = await getFrame()?.evaluate(() => (window as any).__getHipsRot?.()) ?? 'FRAME_NOT_FOUND'
  console.log('NECK_ROT='  + JSON.stringify(neck))
  console.log('HEAD_ROT='  + JSON.stringify(head))
  console.log('ROOT_ROT='  + JSON.stringify(root))
  console.log('SPINE_ROT=' + JSON.stringify(spine))
  console.log('HIPS_ROT='  + JSON.stringify(hips))
})
