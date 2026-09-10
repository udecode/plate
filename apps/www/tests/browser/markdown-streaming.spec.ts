import { expect, test } from '@playwright/test';

const scenarios = [
  ['columns', 33, 'paragraph'],
  ['links', 4, 'Link to OpenAI'],
  ['lists', 3, 'Task C'],
  ['listWithImage', 6, 'Links and Images'],
  ['nestedStructureBlock', 12, 'BasicEditor'],
  ['table', 13, 'Paragraph should exist from table'],
] as const;

for (const mode of ['Plate', 'PlateStatic']) {
  test(`${mode} replays every Markdown scenario and navigates applied chunks`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/blocks/markdown-streaming-demo');
    if (mode === 'PlateStatic') {
      await page
        .getByRole('button', { name: 'Switch to PlateStatic', exact: true })
        .click();
    }
    await page
      .getByRole('combobox', { name: 'Playback speed' })
      .selectOption('10');
    const output = page.locator('[data-plite-editor]').last();

    for (const [scenario, count, text] of scenarios) {
      await page
        .getByRole('combobox', { name: 'Test scenario' })
        .selectOption(scenario);
      await page.getByRole('button', { name: 'Play', exact: true }).click();
      await expect(
        page.getByRole('heading', {
          name: `Transformed Chunks (${count}/${count})`,
          exact: true,
        })
      ).toBeVisible();
      await expect(output).toContainText(text);
      if (scenario === 'columns') {
        const columns = output.locator('[class~="group/column"]');
        await expect(columns).toHaveCount(3);
        await expect(columns.locator('[data-plite-string]')).toHaveText([
          '1',
          '2',
          '3',
        ]);
        await expect(output).not.toContainText('<column');
      }
      await expect(
        page.getByRole('button', { name: 'Play', exact: true })
      ).toBeVisible();
      await page
        .getByRole('button', { name: 'Previous chunk', exact: true })
        .click();
      await expect(
        page.getByRole('heading', {
          name: `Transformed Chunks (${count - 1}/${count})`,
          exact: true,
        })
      ).toBeVisible();
      await page
        .getByRole('button', { name: 'Next chunk', exact: true })
        .click();
      await expect(output).toContainText(text);
      await page.getByRole('button', { name: 'Play', exact: true }).click();
      await expect(
        page.getByRole('heading', {
          name: `Transformed Chunks (${count}/${count})`,
          exact: true,
        })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Play', exact: true })
      ).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test(`${mode} cancels stale playback on reset, navigation and switches`, async ({
    page,
  }) => {
    await page.goto('/blocks/markdown-streaming-demo');
    if (mode === 'PlateStatic') {
      await page
        .getByRole('button', { name: 'Switch to PlateStatic', exact: true })
        .click();
    }
    await page
      .getByRole('combobox', { name: 'Playback speed' })
      .selectOption('200');
    const progress = page.getByRole('heading', { name: /Transformed Chunks/ });
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    const paused = await progress.innerText();
    await page.waitForTimeout(450);
    await expect(progress).toHaveText(paused);
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await expect(progress).not.toHaveText(paused);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await page.waitForTimeout(450);
    await expect(progress).toHaveText('Transformed Chunks (0/33)');
    await expect(
      page.getByRole('button', { name: 'Play', exact: true })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.getByRole('button', { name: 'Next chunk', exact: true }).click();
    const navigated = await progress.innerText();
    await page.waitForTimeout(450);
    await expect(progress).toHaveText(navigated);
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page
      .getByRole('combobox', { name: 'Test scenario' })
      .selectOption('lists');
    await page.waitForTimeout(450);
    await expect(progress).toHaveText('Transformed Chunks (0/3)');
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page
      .getByRole('button', {
        name: `Switch to ${mode === 'Plate' ? 'PlateStatic' : 'Plate'}`,
        exact: true,
      })
      .click();
    await page.waitForTimeout(450);
    await expect(progress).toHaveText('Transformed Chunks (0/3)');
    await expect(
      page.getByRole('button', { name: 'Play', exact: true })
    ).toBeVisible();
  });
}
