import { expect, test, type Page } from '@playwright/test'

const initializeBrowserState = async (
  page: Page,
  options: { dismissTutorial?: boolean; quickMatch?: boolean } = {},
) => {
  await page.addInitScript(
    ({ dismissTutorial, quickMatch }) => {
      if (sessionStorage.getItem('e2e-initialized')) return

      localStorage.clear()
      sessionStorage.setItem('e2e-initialized', 'true')
      if (dismissTutorial) {
        localStorage.setItem(
          'badminton-score-tracker:tutorial:v1',
          JSON.stringify({ dismissed: true, version: 1 }),
        )
      }
      if (quickMatch) {
        localStorage.setItem(
          'badminton-score-tracker:match-settings',
          JSON.stringify({
            pointsToWin: 2,
            winByTwo: false,
            maximumScore: 3,
            gamesToWin: 2,
          }),
        )
      }
    },
    options,
  )
}

test('scores and exercises the main match controls', async ({ page }) => {
  await initializeBrowserState(page, { dismissTutorial: true })
  await page.goto('/')

  await page.getByRole('button', { name: 'Add a point to Player / Team 1' }).click()
  await expect(page.getByLabel('Player / Team 1 score')).toHaveText('1')

  await page.getByRole('button', { name: 'Player / Team 1', exact: true }).click()
  const nameInput = page.getByRole('textbox', { name: 'Name for left side' })
  await nameInput.fill('Samuel')
  await nameInput.press('Enter')

  await page.getByRole('button', { name: 'Open center menu' }).click()
  await page.getByRole('button', { name: 'Swap teams' }).click()
  await expect(
    page.locator('.score-side--right').getByRole('button', {
      name: 'Samuel',
      exact: true,
    }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Reset match' }).click()
  const resetDialog = page.getByRole('alertdialog', { name: 'Reset match?' })
  await expect(resetDialog).toBeVisible()
  await resetDialog.getByRole('button', { name: 'Cancel', exact: true }).click()

  await page.getByRole('button', { name: 'Open center menu' }).click()
  await page.getByRole('button', { name: 'Match settings' }).click()
  const settingsDialog = page.getByRole('dialog', { name: 'Settings' })
  await settingsDialog.getByRole('tab', { name: 'General settings' }).click()
  await expect(
    settingsDialog.getByRole('checkbox', { name: 'Keep screen awake' }),
  ).toBeChecked()
  await settingsDialog.getByRole('button', { name: 'Cancel', exact: true }).click()

  await page.getByRole('button', { name: 'Open center menu' }).click()
  await page.getByRole('button', { name: 'Select serving team' }).click()
  await page.getByRole('button', { name: 'Select Player / Team 2 to serve' }).click()
  await expect(page.getByRole('status', { name: 'Player / Team 2 is serving' })).toBeVisible()
})

test('completes a multi-set match and recovers the new-match action', async ({ page }) => {
  await initializeBrowserState(page, { dismissTutorial: true, quickMatch: true })
  await page.goto('/')

  const scoreLeft = page.getByRole('button', {
    name: 'Add a point to Player / Team 1',
  })
  await scoreLeft.click()
  await scoreLeft.click()
  await expect(page.getByRole('alertdialog', { name: 'Player / Team 1' })).toBeVisible()
  await page.getByRole('button', { name: 'Next game' }).click()

  await page.getByRole('button', { name: 'Open set history' }).click()
  await page.getByRole('button', { name: /Set 1.*Player \/ Team 1.*2 - 0/ }).click()
  await expect(page.getByLabel('Player / Team 1 score')).toHaveText('2')
  await page.getByRole('button', { name: 'Back to live match' }).click()

  await scoreLeft.click()
  await scoreLeft.click()
  await expect(page.getByText('Match winner')).toBeVisible()
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(
    page.getByRole('button', { name: /Match complete.*Reopen result/ }),
  ).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: /Match complete.*Reopen result/ }).click()
  await page.getByRole('button', { name: 'New match' }).click()

  await expect(page.getByLabel('Player / Team 1 score')).toHaveText('0')
  await expect(page.getByLabel('Player / Team 2 score')).toHaveText('0')
  await expect(page.getByRole('button', { name: 'Open set history' })).toHaveCount(0)
})

test('offers the shortened tutorial', async ({ page }) => {
  await initializeBrowserState(page)
  await page.goto('/')

  await expect(page.getByRole('dialog', { name: 'Learn the score tracker' })).toBeVisible()
  await page.getByRole('button', { name: 'Start tutorial' }).click()
  await expect(page.getByRole('region', { name: 'Tutorial step 1 of 12' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip all' }).click()
  await expect(page.getByRole('region', { name: /Tutorial step/ })).toHaveCount(0)
})

test('moves, expands, and updates the visual service court', async ({ page }) => {
  await initializeBrowserState(page, { dismissTutorial: true })
  await page.goto('/')

  let court = page.getByRole('button', {
    name: /Visual service court.*No server selected/,
  })
  const initialBounds = await court.boundingBox()
  expect(initialBounds).not.toBeNull()
  if (!initialBounds) return

  await page.mouse.move(
    initialBounds.x + initialBounds.width / 2,
    initialBounds.y + initialBounds.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    initialBounds.x + initialBounds.width / 2 - 100,
    initialBounds.y + initialBounds.height / 2 - 80,
    { steps: 5 },
  )
  await page.mouse.up()

  await expect(page.getByLabel('Player / Team 1 score')).toHaveText('0')
  await expect(page.getByRole('dialog', { name: 'Service court' })).toHaveCount(0)
  const savedPosition = await page.evaluate(() =>
    localStorage.getItem('badminton-score-tracker:service-court-position:v1'),
  )
  expect(savedPosition).not.toBeNull()

  await page.reload()
  expect(
    await page.evaluate(() =>
      localStorage.getItem('badminton-score-tracker:service-court-position:v1'),
    ),
  ).toBe(savedPosition)

  await page.setViewportSize({ width: 390, height: 844 })
  court = page.getByRole('button', { name: /Visual service court/ })
  const mobileBounds = await court.boundingBox()
  expect(mobileBounds).not.toBeNull()
  expect(mobileBounds!.x).toBeGreaterThanOrEqual(8)
  expect(mobileBounds!.y).toBeGreaterThanOrEqual(8)
  expect(mobileBounds!.x + mobileBounds!.width).toBeLessThanOrEqual(382)
  expect(mobileBounds!.y + mobileBounds!.height).toBeLessThanOrEqual(836)

  await court.click()
  await expect(page.getByRole('dialog', { name: 'Service court' })).toBeVisible()
  await page.getByRole('button', { name: 'Close service court' }).click()

  await page.getByRole('button', { name: 'Open center menu' }).click()
  await page.getByRole('button', { name: 'Select serving team' }).click()
  await expect(page.getByRole('button', { name: /Visual service court/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Select Player / Team 2 to serve' }).click()
  await expect(
    page.getByRole('button', {
      name: /Visual service court.*Player \/ Team 2 serves from the top court/,
    }),
  ).toBeVisible()

  await page.evaluate(() => {
    localStorage.setItem(
      'badminton-score-tracker:general-settings:v1',
      JSON.stringify({
        courtVisualizationEnabled: true,
        keepScreenAwakeEnabled: false,
        playerServeIndicatorEnabled: true,
        teamServeIndicatorEnabled: true,
      }),
    )
  })
  await page.reload()
  await page.getByRole('button', { name: 'Open center menu' }).click()
  await page.getByRole('button', { name: 'Select serving team' }).click()
  await page.getByRole('button', { name: 'Select Player 1 of Player / Team 1' }).click()
  await page.getByRole('button', { name: 'Select Player 2 of Player / Team 2' }).click()
  await page.getByRole('button', { name: 'Select Player 2 of Player / Team 1' }).click()
  await page.getByRole('button', { name: /Visual service court/ }).click()

  const expandedCourt = page.locator('.service-court__surface--expanded')
  const leftTop = expandedCourt.locator('.service-court__cell--left-top')
  const leftBottom = expandedCourt.locator('.service-court__cell--left-bottom')
  await page.getByRole('button', {
    name: 'Swap Player / Team 1 player positions',
  }).click()
  await expect(leftTop).toContainText('Player 2')
  await page.getByRole('button', {
    name: 'Select Player 2 of Player / Team 1',
  }).click()
  await page.getByRole('button', {
    name: 'Make Player 2 of Player / Team 1 serve',
  }).click()

  await expect(leftBottom).toContainText('Player 2')
  await expect(page.locator('.service-court__serve-path')).toHaveAttribute(
    'data-flight',
    '25-75-75-25',
  )
  await expect(page.locator('.service-court__serve-trail')).toHaveAttribute(
    'd',
    'M 25 75 Q 50 6 75 25',
  )
  expect(
    await page.locator('.service-court__serve-trail').evaluate((trail) => ({
      linecap: getComputedStyle(trail).strokeLinecap,
      pathRepeatCounts: [...trail.querySelectorAll('animate')].map(
        (animation) => animation.getAttribute('repeatCount'),
      ),
      stopAnimations: trail.parentElement?.querySelectorAll('stop animate').length,
    })),
  ).toEqual({
    linecap: 'round',
    pathRepeatCounts: ['indefinite'],
    stopAnimations: 5,
  })
  await expect(
    page.getByRole('status', {
      name: 'Player 2 of Player / Team 1 is serving',
    }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Close service court' }).click()
  await page.getByRole('button', {
    name: 'Add a point to Player / Team 1',
  }).click()
  await expect(
    page.getByRole('button', {
      name: /Visual service court.*Player 2 of Player \/ Team 1 is serving from the top court/,
    }),
  ).toBeVisible()
})

test('reloads offline with saved match state', async ({ context, page }) => {
  await initializeBrowserState(page, { dismissTutorial: true })
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', resolve, {
          once: true,
        }),
      )
    }
  })

  await page.getByRole('button', { name: 'Add a point to Player / Team 1' }).click()
  await expect(page.getByLabel('Player / Team 1 score')).toHaveText('1')

  await context.setOffline(true)
  try {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('main', { name: 'Badminton score tracker' })).toBeVisible()
    await expect(page.getByLabel('Player / Team 1 score')).toHaveText('1')
  } finally {
    await context.setOffline(false)
  }
})

test('supports localhost reset1 and reset2 keyboard commands', async ({ page }) => {
  await initializeBrowserState(page, { dismissTutorial: true })
  await page.goto('/')

  await page.getByRole('button', { name: 'Player / Team 1', exact: true }).click()
  const nameInput = page.getByRole('textbox', { name: 'Name for left side' })
  await nameInput.fill('Changed Team')
  await nameInput.press('Enter')
  await page.getByRole('button', { name: 'Add a point to Changed Team' }).click()
  await page.keyboard.type('reset1')

  await expect(page.getByRole('dialog', { name: 'Learn the score tracker' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Player / Team 1', exact: true })).toBeVisible()
  await expect(page.getByLabel('Player / Team 1 score')).toHaveText('0')

  await page.getByRole('button', { name: 'Skip all' }).click()
  await page.getByRole('button', { name: 'Add a point to Player / Team 2' }).click()
  await page.keyboard.type('reset2')

  await expect(page.getByRole('dialog', { name: 'Learn the score tracker' })).toHaveCount(0)
  await expect(page.getByLabel('Player / Team 1 score')).toHaveText('0')
  await expect(page.getByLabel('Player / Team 2 score')).toHaveText('0')
  expect(
    await page.evaluate(() =>
      JSON.parse(
        localStorage.getItem('badminton-score-tracker:tutorial:v1') ?? 'null',
      ),
    ),
  ).toEqual({ dismissed: true, version: 1 })
})