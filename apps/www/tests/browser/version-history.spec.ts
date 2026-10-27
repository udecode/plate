import {
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';

test('saved revisions render a structural comparison of the document', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/version-history-demo', {
      waitUntil: 'networkidle',
    });
    const editor = page.locator('[data-editor="true"]').first();

    await expect(editor).toBeVisible({ timeout: 20_000 });
    await editor.getByText('Edit this text, then save a revision.').click();
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

test('restores a saved revision as one undoable edit', async ({ page }) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    await page.goto('/blocks/version-history-demo', {
      waitUntil: 'networkidle',
    });
    const editor = page.locator('[data-editor="true"]').first();
    const line = editor.getByText('Edit this text, then save a revision.');

    await expect(editor).toBeVisible({ timeout: 20_000 });
    await line.click();
    await page.keyboard.press('End');
    await page.keyboard.insertText(' saved');
    await page.getByRole('button', { name: 'Save revision' }).click();
    await editor.getByText('save a revision. saved').click();
    await page.keyboard.press('End');
    await page.keyboard.insertText(' unsaved');
    await expect(editor).toContainText('save a revision. saved unsaved');

    await page.getByRole('button', { name: 'Restore revision 1' }).click();
    await expect(editor).toHaveText(
      'Save a revision after each edit to compare them.Edit this text, then save a revision.'
    );
    await page.getByRole('button', { name: 'Restore revision 2' }).click();
    await expect(editor).toContainText('save a revision. saved');
    await expect(editor).not.toContainText('unsaved');
    await editor.click();
    await page.keyboard.press('ControlOrMeta+z');
    await expect(editor).toHaveText(
      'Save a revision after each edit to compare them.Edit this text, then save a revision.'
    );
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('the docs preview does not clip the structural comparison', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/docs/examples/version-history', {
      waitUntil: 'networkidle',
    });
    const editor = page.locator('[data-editor="true"]').first();

    await expect(editor).toBeVisible({ timeout: 20_000 });
    await editor.getByText('Edit this text, then save a revision.').click();
    await page.keyboard.press('End');
    await page.keyboard.insertText(' plus revision');
    await page.getByRole('button', { name: 'Save revision' }).click();

    const comparison = page.locator('[data-comparison-id]');
    await expect(comparison).toBeVisible({ timeout: 20_000 });
    const clippedAncestor = await comparison.evaluate((node) => {
      let element = node.parentElement;

      while (element && element !== document.body) {
        const style = getComputedStyle(element);
        if (
          (style.overflowY === 'hidden' || style.overflow === 'hidden') &&
          element.scrollHeight > element.clientHeight + 1
        ) {
          return {
            className: element.className,
            clientHeight: element.clientHeight,
            scrollHeight: element.scrollHeight,
          };
        }
        element = element.parentElement;
      }

      return null;
    });

    expect(clippedAncestor).toBeNull();
    const after = comparison.getByText('After', { exact: true });
    await after.scrollIntoViewIfNeeded();
    await expect(after).toBeVisible();
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
