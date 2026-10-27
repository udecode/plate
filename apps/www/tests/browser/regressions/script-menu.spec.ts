import {
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';

for (const [label, script] of [
  ['Subscript', 'sub'],
  ['Superscript', 'sup'],
] as const) {
  test(`More formatting renders ${label.toLowerCase()} on the selected digit [plate#5210]`, async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      await page.goto('/docs/basic-marks', { waitUntil: 'commit' });
      const editor = page
        .locator('[data-editor="true"][contenteditable="true"]')
        .first();
      const harness = createBrowserEditorHarness(
        page,
        `script-menu-${script}`,
        editor
      );
      await harness.ready({ editor: 'visible', text: 'Text Formatting' });
      await editor
        .getByText(
          'Add style and emphasis to your text using various formatting options.',
          { exact: true }
        )
        .click();
      await page.keyboard.press('End');
      await page.keyboard.press('Enter');
      await page.keyboard.type('123');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('Shift+ArrowLeft');
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString()))
        .toBe('2');
      await page
        .getByRole('button', { name: 'More formatting', exact: true })
        .last()
        .click();
      await page.getByRole('menuitem', { name: label, exact: true }).click();
      expect(await harness.get.modelValue()).toMatchObject({
        children: expect.arrayContaining([
          expect.objectContaining({
            children: [{ text: '1' }, { script, text: '2' }, { text: '3' }],
          }),
        ]),
      });
      await expect(editor.locator(script, { hasText: '2' })).toHaveText('2');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}
