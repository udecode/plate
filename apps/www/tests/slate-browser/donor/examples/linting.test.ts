import { expect, test } from '@playwright/test';

import { openExample } from '@platejs/browser/playwright';

test.describe('linting', () => {
  test('refreshes app-owned lint diagnostics through an external decoration source', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/linting', {
      ready: {
        editor: 'visible',
      },
    });

    await expect(page.locator('.example-page-title')).toContainText('Linting');
    await expect(page.locator('#linting-source')).toHaveText('source:idle');
    await expect(page.locator('#linting-count')).toHaveText('issues:0');
    await expect(page.locator('[data-lint-severity]')).toHaveCount(0);

    await page.getByRole('button', { name: 'Run linter' }).click();

    await expect(page.locator('#linting-source')).toHaveText('source:local');
    await expect(page.locator('#linting-count')).toHaveText('issues:2');
    await expect(page.locator('[data-lint-severity="warning"]')).toHaveCount(1);
    await expect(page.locator('[data-lint-severity="error"]')).toHaveCount(1);
    await expect(page.locator('#linting-snapshot')).toContainText(
      'style-filler-word'
    );
    await expect(page.locator('#linting-snapshot')).toContainText(
      'comma-spacing'
    );

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    if (testInfo.project.name === 'mobile') {
      await editor.insertText('Prefix ');
    } else {
      await page.keyboard.type('Prefix ');
    }

    await expect(
      page.locator('[data-lint-rule="style-filler-word"]')
    ).toHaveText('obviously');
    await expect
      .poll(() =>
        page
          .locator('[data-lint-rule="comma-spacing"]')
          .evaluate((element) => element.textContent)
      )
      .toBe(' ,');

    await page.getByRole('button', { name: 'Apply first fix' }).click();

    await expect(page.locator('#linting-source')).toHaveText('source:fixed');
    await expect(page.locator('#linting-count')).toHaveText('issues:1');
    await expect(page.locator('[data-lint-severity="error"]')).toHaveCount(0);
    await expect(page.locator('#linting-snapshot')).not.toContainText(
      'comma-spacing'
    );

    await page
      .getByRole('button', { name: 'Receive server diagnostics' })
      .click();

    await expect(page.locator('#linting-source')).toHaveText('source:server');
    await expect(page.locator('#linting-count')).toHaveText('issues:2');
    await expect(page.locator('[data-lint-severity="info"]')).toHaveCount(1);
    await expect(page.locator('#linting-snapshot')).toContainText(
      'server-terminology'
    );

    await editor.assert.text(
      'Prefix This paragraph obviously has a spacing problem, and the linter should report it.Server diagnostics can arrive later without changing the Slate document.'
    );

    await page.getByRole('button', { name: 'Clear diagnostics' }).click();

    await expect(page.locator('#linting-source')).toHaveText('source:cleared');
    await expect(page.locator('#linting-count')).toHaveText('issues:0');
    await expect(page.locator('[data-lint-severity]')).toHaveCount(0);
    await expect(page.locator('#linting-snapshot')).toHaveText('none');
  });
});
