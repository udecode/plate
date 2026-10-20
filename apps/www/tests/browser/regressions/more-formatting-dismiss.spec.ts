import { recordBrowserRuntimeErrors } from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('[plate#5209] Closing More formatting with its trigger preserves the floating toolbar', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/cn/docs/block-menu', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    await expect(editor).toBeVisible();
    await editor.locator('[data-editor-string]').first().dblclick();
    const floating = page.locator('[role="toolbar"]').filter({
      has: page.getByRole('button', {
        name: 'Mark as equation',
        exact: true,
      }),
    });
    const trigger = floating.getByRole('button', {
      name: 'More formatting',
      exact: true,
    });
    await expect(trigger).toBeVisible();
    const selected = await page.evaluate(() =>
      window.getSelection()?.toString()
    );
    expect(selected?.length).toBeGreaterThan(0);
    await trigger.click();
    await expect(
      page.getByRole('menuitem', { name: 'Subscript', exact: true })
    ).toBeVisible();
    await trigger.click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(editor).toBeFocused();
    await expect(trigger).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe(selected);
    await page.keyboard.press('Shift+ArrowRight');
    await expect(trigger).toBeVisible();
    await page.getByRole('heading', { level: 1 }).click();
    await expect(floating).toHaveCount(0);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
