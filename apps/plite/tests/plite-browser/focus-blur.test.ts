import { expect, test } from '@playwright/test';

for (const [edit, leave] of [
  ['typing', 'an outside field click'],
  ['typing', 'a page click'],
  ['End', 'Escape'],
] as const) {
  test(`${leave} right after ${edit} blurs the editor and keeps it blurred`, async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto('/focus-blur');

    const fixture = page.getByRole('region', { name: 'draft', exact: true });
    const editor = page.getByRole('textbox', { name: 'draft editor' });
    const focusState = fixture.getByRole('status', { name: 'Draft focus' });
    const field = (await fixture
      .getByRole('textbox', { name: 'Outside field' })
      .boundingBox())!;

    await editor.getByText('one').click();
    await page.keyboard.press('End');
    await expect(focusState).toHaveAttribute('data-focused', 'true');
    // Pausing the clock holds the timers that settle the next edit's selection
    // write, so the blur always lands while that write is still in flight.
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    await (edit === 'typing'
      ? page.keyboard.type('x')
      : page.keyboard.press(edit));
    await (leave === 'Escape'
      ? page.keyboard.press('Escape')
      : leave === 'a page click'
        ? page.mouse.click(5, 5)
        : page.mouse.click(
            field.x + field.width / 2,
            field.y + field.height / 2
          ));
    await page.clock.runFor(200);

    await expect(focusState).toHaveAttribute('data-blur-count', '1');
    await expect(focusState).toHaveAttribute('data-focused', 'false');
    await expect(editor).not.toBeFocused();

    await page.clock.resume();
    await editor.click();
    await page.keyboard.type('y');
    await expect(editor).toContainText('y');
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
