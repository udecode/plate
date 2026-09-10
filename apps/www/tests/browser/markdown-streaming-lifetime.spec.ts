import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

for (const mode of ['editable', 'static'] as const) {
  for (const action of [
    'reset',
    'paused reset',
    'scenario',
    'navigate',
    'mode',
  ] as const) {
    test(`${mode} streaming stops after ${action}`, async ({ page }) => {
      const errors = recordPliteBrowserRuntimeErrors(page);
      await page.goto('/blocks/markdown-streaming-demo', {
        waitUntil: 'commit',
      });
      const heading = page.getByRole('heading', {
        name: /^Transformed Chunks/,
      });
      await expect(heading).toBeVisible({ timeout: 20_000 });
      await createPliteBrowserEditorHarness(
        page,
        'markdown-streaming-demo',
        page.locator('[data-plite-editor="true"]').first()
      ).ready({ editor: 'visible' });
      await page.getByRole('combobox').first().selectOption('lists');
      await expect(heading).toHaveText('Transformed Chunks (0/3)');
      await page.getByRole('combobox').nth(1).selectOption('200');
      if (mode === 'static') {
        await page
          .getByRole('button', { name: 'Switch to PlateStatic', exact: true })
          .click();
      }
      await page.clock.install();
      await page.clock.pauseAt(new Date(Date.now() + 1000));
      await page.locator('button:has(svg.lucide-play)').click();
      await expect(heading).toContainText('(1/');

      if (action === 'paused reset') {
        await page.locator('button:has(svg.lucide-pause)').click();
      }
      if (action === 'reset' || action === 'paused reset') {
        await page.locator('button:has(svg.lucide-rotate-ccw)').click();
      } else if (action === 'scenario') {
        await page.getByRole('combobox').first().selectOption('links');
      } else if (action === 'navigate') {
        await page.locator('button:has(svg.lucide-chevron-last)').click();
      } else {
        await page.getByRole('button', { name: /^Switch to/ }).click();
      }

      const stoppedHeading = await heading.textContent();
      const output = page
        .getByRole('heading', { name: 'Editor Output' })
        .locator('..');
      const stoppedOutput = await output.textContent();
      await page.clock.runFor(2000);
      await expect(heading).toHaveText(stoppedHeading!);
      await expect(output).toHaveText(stoppedOutput!);
      await expect(page.locator('button:has(svg.lucide-play)')).toBeVisible();
      errors.assertNone();
      errors.stop();
    });
  }
}
