import { expect, test } from '@playwright/test';

test('clears a stored cursor before focus enters a nested editable', async ({
  page,
}) => {
  await page.goto('/examples/plite/cursor-overlay-ordering');

  const cursorState = page.getByTestId('cursor-overlay-state');
  const nestedEditable = page.getByTestId('nested-editable');

  await page.getByRole('button', { name: 'Restore selection cursor' }).click();
  await expect(cursorState).toHaveText('present');

  await nestedEditable.click();

  await expect(cursorState).toHaveText('cleared');
  await expect
    .poll(() =>
      page.evaluate(() => {
        const activeElement = document.activeElement;

        return {
          ariaLabel: activeElement?.getAttribute('aria-label'),
          testId: activeElement?.getAttribute('data-test-id'),
        };
      })
    )
    .toEqual({
      ariaLabel: 'Nested cursor editor',
      testId: 'nested-editable',
    });
});
