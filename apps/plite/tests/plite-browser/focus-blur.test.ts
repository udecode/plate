import { expect, type Locator, type Page, test } from '@playwright/test';

for (const [destination, findTarget] of [
  [
    'a focusable control',
    (fixture: Locator) =>
      fixture.getByRole('textbox', { name: 'Outside field' }),
  ],
  [
    'the page background',
    (_fixture: Locator, page: Page) =>
      page.getByRole('heading', { name: 'Explicit editor blur' }),
  ],
] as const) {
  test(`a click on ${destination} right after typing blurs the editor`, async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto('/focus-blur');

    const fixture = page.getByRole('region', { name: 'default', exact: true });
    const editor = page.getByRole('textbox', { name: 'default editor' });
    const focusState = fixture.getByRole('status', { name: 'Editor focus' });
    const target = (await findTarget(fixture, page).boundingBox())!;

    await editor.getByText('one').click();
    await expect(focusState).toHaveAttribute('data-focused', 'true');
    // The frozen clock holds the selection write for this keystroke open
    // across the click, so the blur lands inside it every run.
    await page.keyboard.type('x');
    await page.mouse.click(
      target.x + target.width / 2,
      target.y + target.height / 2
    );

    await expect(editor).not.toBeFocused();
    await expect(focusState).toHaveAttribute('data-editor-blur-count', '1');
    await expect(focusState).toHaveAttribute('data-focused', 'false');

    await page.clock.runFor(100);
    await editor.getByText('onex').click();
    await page.keyboard.press('End');
    await page.keyboard.type('y');
    await expect(editor.locator('[data-editor-node="element"]').first()).toHaveText(
      'onexy'
    );
  });
}

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
    const target = editor.locator('[data-editor-node="element"]').nth(1);
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
