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

test('retained author history uses an internal vertical scroller', async ({
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
      .getByText(
        'Edit this text as Alice or Bob, then revert one contribution.'
      )
      .click();
    await page.keyboard.press('End');
    for (let index = 0; index < 6; index++) {
      await page.keyboard.insertText(String(index));
    }

    const history = page.getByTestId('author-history');
    await expect(history.locator('li')).toHaveCount(6);
    await expect
      .poll(() =>
        history.evaluate((element) => ({
          clientHeight: element.clientHeight,
          overflowY: getComputedStyle(element).overflowY,
          scrollHeight: element.scrollHeight,
        }))
      )
      .toMatchObject({ overflowY: 'auto' });
    expect(
      await history.evaluate(
        (element) => element.scrollHeight > element.clientHeight
      )
    ).toBe(true);
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
    await editor
      .getByText('This document keeps each accepted edit by author.')
      .click();
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
