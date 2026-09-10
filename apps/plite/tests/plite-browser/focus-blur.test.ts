import { expect, test } from '@playwright/test';

for (const [variant, tag] of [
  ['default', 'DIV'],
  ['intrinsic', 'P'],
  ['custom', 'SECTION'],
] as const) {
  test(`explicit blur cancels queued focus for the ${variant} host`, async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto('/focus-blur');

    const fixture = page.getByRole('region', { name: variant, exact: true });
    const editor = page.getByRole('textbox', { name: `${variant} editor` });
    const target = editor.locator('[data-plite-node="element"]').nth(1);
    const focusButton = fixture.getByRole('button', {
      name: 'Focus',
      exact: true,
    });
    const blurButton = fixture.getByRole('button', { name: 'Focus then blur' });

    await focusButton.click();
    await expect(editor).toBeFocused();
    await expect(target).toHaveAttribute('placeholder', 'Type here');
    await expect(target).toHaveJSProperty('tagName', tag);

    await blurButton.click();
    await expect(blurButton).toHaveAttribute('data-blur-count', '1');
    await page.clock.runFor(100);
    await expect(editor).not.toBeFocused();
    await expect(target).not.toHaveAttribute('placeholder');
    await expect(target).not.toHaveClass(/block-placeholder/);

    await focusButton.click();
    await expect(editor).toBeFocused();
    await expect(target).toHaveAttribute('placeholder', 'Type here');
    await page.keyboard.type('after blur');
    await expect(target).toHaveText('after blur');
  });
}
