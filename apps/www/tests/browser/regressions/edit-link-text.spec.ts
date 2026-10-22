import { recordBrowserRuntimeErrors } from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('[plate#5228] Edit link fills Text to display with the link text', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const editLink = page.getByRole('button', { name: 'Edit link' });
    const form = page.locator('.cn-popover-content:visible');
    const urlInput = form.getByPlaceholder('Paste link');
    const textInput = form.getByPlaceholder('Text to display');

    await editor.locator('a', { hasText: 'slash command' }).click();
    await editLink.click();
    await expect(urlInput).toHaveValue('/docs/slash-command');
    await expect(textInput).toHaveValue('slash command');

    await textInput.fill('slash menu');
    await textInput.press('Enter');
    await expect(editor.locator('a', { hasText: 'slash menu' })).toBeVisible();
    await expect(editLink).toBeHidden();

    await editor.locator('[data-editor-string]').first().click();
    await editor.locator('a', { hasText: 'slash menu' }).click();
    await editLink.click();
    await expect(textInput).toHaveValue('slash menu');

    await urlInput.fill('/docs/slash-menu');
    await urlInput.press('Enter');
    await expect(
      editor.locator('a[href="/docs/slash-menu"]', { hasText: 'slash menu' })
    ).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
