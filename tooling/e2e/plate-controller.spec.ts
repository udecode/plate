import { type Page, expect, test } from '@playwright/test';

test.describe('PlateController', () => {
  const addEditor = (page: Page) =>
    page.getByRole('button', { name: 'Add editor' }).click();

  const removeEditor = (page: Page, id: string) =>
    page.getByRole('button', { name: `Remove editor ${id}` }).click();

  const focusEditor = (page: Page, id: string) =>
    page.getByText(`Editor ${id}`, { exact: true }).click({ force: true });

  const blurEditor = (page: Page) => page.getByRole('paragraph').first().click();

  const expectActiveEditor = (page: Page, id: string) =>
    expect(page.getByTestId('active-editor')).toHaveText(id);

  test.beforeEach(async ({ page }) => {
    // Starts with two editors with IDs 1 and 2
    await page.goto('/e2e-examples/plate-controller');
  });

  test('defaults to first editor', async ({ page }) => {
    await expectActiveEditor(page, '1');
  });

  test('switches to second editor if first is removed', async ({ page }) => {
    await removeEditor(page, '1');
    await expectActiveEditor(page, '2');
  });

  test('switches to focused editor', async ({ page }) => {
    await addEditor(page);
    await addEditor(page);

    await focusEditor(page, '2');
    await expectActiveEditor(page, '2');

    await focusEditor(page, '4');
    await expectActiveEditor(page, '4');

    await focusEditor(page, '3');
    await expectActiveEditor(page, '3');

    await blurEditor(page);
    await expectActiveEditor(page, '3');

    await removeEditor(page, '4');
    await expectActiveEditor(page, '3');

    await removeEditor(page, '3');
    await expectActiveEditor(page, '1');
  });
});
