import { recordBrowserRuntimeErrors } from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('saved revisions render a structural comparison of the authored document', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/version-history-demo', {
      waitUntil: 'networkidle',
    });
    const editor = page.locator('[data-editor="true"]').first();

    await expect(editor).toBeVisible({ timeout: 20_000 });
    await editor
      .getByText('This document keeps each accepted edit by author.')
      .click();
    await page.keyboard.press('End');
    await page.keyboard.insertText(' plus revision');
    await expect(editor).toContainText('plus revision');

    await page.getByRole('button', { name: 'Save revision' }).click();
    const comparison = page.locator('[data-comparison-id]');

    await expect(comparison).toBeVisible({ timeout: 20_000 });
    await expect(comparison).toContainText('plus revision');
    await expect(comparison).toContainText('Before');
    await expect(comparison).toContainText('After');
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
