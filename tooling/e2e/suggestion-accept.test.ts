import { expect, test } from '@playwright/test';

import { recordPliteBrowserRuntimeErrors } from '../../packages/test/src/playwright/runtime-errors';

test('accepts the seeded removal suggestion without crashing', async ({
  page,
}) => {
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page, { strict: true });
  const editor = page.locator(
    '[data-plite-editor="true"][contenteditable="true"]'
  );

  try {
    await page.goto('/');
    await expect(editor).toHaveCount(1);
    await expect(
      editor.getByText('mark text for removal', { exact: true })
    ).toBeVisible();

    await editor.getByText('mark text for removal', { exact: true }).click();

    const dialog = page.getByRole('dialog');
    const deleteLabel = dialog.getByText('Delete:', { exact: true });
    const deleteCard = deleteLabel
      .locator('..')
      .locator('..')
      .locator('..')
      .locator('..');

    await expect(deleteCard).toHaveCount(1);
    await expect(deleteCard).toHaveClass(/flex flex-col p-4/);
    await deleteCard.hover();

    await expect(
      deleteCard.getByRole('button', { name: 'Accept suggestion' })
    ).toBeVisible();
    await deleteCard.getByRole('button', { name: 'Accept suggestion' }).click();

    await expect(
      editor.getByText('mark text for removal', { exact: true })
    ).toHaveCount(0);
    await expect(dialog.getByText('Delete:', { exact: true })).toHaveCount(0);
    await expect(editor).toHaveCount(1);

    const heading = editor.locator('[data-plite-string="true"]', {
      hasText: 'Collaborative Editing',
    });

    await heading.click();
    await page.keyboard.press('End');
    await page.keyboard.type('!');
    await expect(heading).toHaveText('Collaborative Editing!');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('opens the seeded suggestion list from the count trigger', async ({
  page,
}) => {
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page, { strict: true });
  const editor = page.locator(
    '[data-plite-editor="true"][contenteditable="true"]'
  );

  try {
    await page.goto('/');
    await expect(editor).toHaveCount(1);
    await page.getByRole('button', { exact: true, name: '5' }).click();
    await expect(
      page.getByRole('dialog').getByText('Delete:', { exact: true })
    ).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
