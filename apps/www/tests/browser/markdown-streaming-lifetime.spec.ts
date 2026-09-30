import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

const open = async (page: Page, mode: 'editable' | 'static') => {
  await page.goto('/blocks/markdown-streaming-demo', {
    waitUntil: 'commit',
  });
  const heading = page.getByRole('heading', { name: /^Chunks/ });
  await expect(heading).toBeVisible({ timeout: 20_000 });
  await createBrowserEditorHarness(
    page,
    'markdown-streaming-demo',
    page.locator('[data-editor="true"]').first()
  ).ready({ editor: 'visible' });
  if (mode === 'static') {
    await page.getByLabel('Preview', { exact: true }).selectOption('static');
  }

  return {
    heading,
    output: page.getByRole('heading', { name: 'Editor Output' }).locator('..'),
    status: page.locator('[data-stream-status]'),
  };
};

for (const mode of ['editable', 'static'] as const) {
  test(`${mode} streaming renders columns`, async ({ page }) => {
    const errors = recordBrowserRuntimeErrors(page);

    try {
      const { heading, output, status } = await open(page, mode);
      await page
        .getByLabel('Scenario', { exact: true })
        .selectOption('columns');
      await page.getByLabel('Chunk delay', { exact: true }).selectOption('10');
      await page
        .getByRole('button', { name: 'Start streaming', exact: true })
        .click();
      await expect(heading).toHaveText(/^Chunks \(([1-9]\d*)\/\1\)$/);
      await expect(status).toHaveText('Finished: strict parse');
      await expect(
        page.getByRole('button', { name: 'Start streaming', exact: true })
      ).toBeVisible();

      // Editable columns also render their drag handle glyph.
      await expect(output.locator('[class~="group/column"]')).toHaveText([
        /1$/,
        /2$/,
        /3$/,
      ]);
      await expect(output).not.toContainText(/<\/?column(?:Group|_group)/);
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });

  test(`${mode} stop parses the current draft strictly`, async ({ page }) => {
    const errors = recordBrowserRuntimeErrors(page);

    try {
      const { heading, output, status } = await open(page, mode);
      await page.getByLabel('Chunk delay', { exact: true }).selectOption('200');
      await page.clock.install();
      await page.clock.pauseAt(new Date(Date.now() + 1000));
      await page
        .getByRole('button', { name: 'Start streaming', exact: true })
        .click();
      await expect(heading).toContainText('(1/');
      // The partial preview hides the tag that is still arriving.
      await expect(output).toContainText('paragraph');
      await expect(output).not.toContainText('<column');

      await page
        .getByRole('button', { name: 'Stop streaming', exact: true })
        .click();
      await expect(status).toHaveText('Stopped: strict parse');
      await expect(output).toContainText('<column');

      const stoppedHeading = await heading.textContent();
      const stoppedOutput = await output.textContent();
      await page.clock.runFor(2000);
      await expect(heading).toHaveText(stoppedHeading!);
      await expect(output).toHaveText(stoppedOutput!);
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });

  for (const action of [
    'reset',
    'paused reset',
    'scenario',
    'navigate',
    'mode',
  ] as const) {
    test(`${mode} streaming stops after ${action}`, async ({ page }) => {
      const errors = recordBrowserRuntimeErrors(page);
      const { heading, output, status } = await open(page, mode);
      await page.getByLabel('Scenario', { exact: true }).selectOption('lists');
      await expect(heading).toHaveText('Chunks (0/7)');
      await page.getByLabel('Chunk delay', { exact: true }).selectOption('200');
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
        await page
          .getByLabel('Scenario', { exact: true })
          .selectOption('links');
      } else if (action === 'navigate') {
        await page.locator('button:has(svg.lucide-chevron-last)').click();
      } else {
        await page
          .getByLabel('Preview', { exact: true })
          .selectOption(mode === 'static' ? 'editable' : 'static');
      }

      // Ready renders with the action's own output, which a static preview
      // may commit after the action returns.
      await expect(status).toHaveText('Ready');
      const stoppedHeading = await heading.textContent();
      const stoppedOutput = await output.textContent();
      await page.clock.runFor(2000);
      await expect(heading).toHaveText(stoppedHeading!);
      await expect(output).toHaveText(stoppedOutput!);
      await expect(status).toHaveText('Ready');
      await expect(page.locator('button:has(svg.lucide-play)')).toBeVisible();
      errors.assertNone();
      errors.stop();
    });
  }
}
