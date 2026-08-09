import { expect, type Page, test } from '@playwright/test';

const recordRuntimeErrors = (page: Page) => {
  const errors: string[] = [];
  const onConsole = (message: { text: () => string; type: () => string }) => {
    if (message.type() === 'error') errors.push(message.text());
  };
  const onPageError = (error: Error) => {
    errors.push(error.stack ?? error.message);
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    assertNone: () => expect(errors).toEqual([]),
    stop: () => {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
};

test('accepts the seeded removal suggestion without crashing', async ({
  page,
}) => {
  const runtimeErrors = recordRuntimeErrors(page);
  const editor = page.locator(
    '[data-plite-editor="true"][contenteditable="true"]'
  );

  try {
    await page.goto('/');
    await expect(editor).toHaveCount(1);
    await expect(
      editor.getByText('mark text for removal', { exact: true })
    ).toBeVisible();

    await page.getByRole('button', { exact: true, name: '5' }).click();

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

    const actionButtons = deleteCard.locator('button:not(:disabled)');

    await expect(actionButtons).toHaveCount(2);
    await actionButtons.first().click();

    await expect(
      editor.getByText('mark text for removal', { exact: true })
    ).toHaveCount(0);
    await expect(dialog.getByText('Delete:', { exact: true })).toHaveCount(0);

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
