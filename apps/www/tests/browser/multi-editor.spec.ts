import { recordPliteBrowserRuntimeErrors } from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

for (const base of ['Base UI', 'Radix']) {
  for (const width of [1280, 390]) {
    test(`${base}: exact mounted targets at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 844 });
      const errors = recordPliteBrowserRuntimeErrors(page, { strict: true });
      await page.goto('/dev/multi-editor');
      await page.getByRole('button', { name: base, exact: true }).click();
      const a = page.getByRole('textbox', { name: 'A', exact: true });
      const copy = page.getByRole('textbox', { name: 'A copy', exact: true });
      const b = page.getByRole('textbox', { name: 'B', exact: true });
      const bold = page.getByRole('button', { name: 'Bold', exact: true });
      const undo = page.getByRole('button', { name: 'Undo', exact: true });
      const redo = page.getByRole('button', { name: 'Redo', exact: true });
      const modelA = page.getByTestId('model-a');
      const modelB = page.getByTestId('model-b');

      await a.click();
      await a.press('ControlOrMeta+A');
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString()))
        .toBe('note');
      await bold.click();
      await expect(a.locator('strong')).toHaveText('note');
      await expect(copy.locator('strong')).toHaveText('note');
      await expect(b.locator('strong')).toHaveCount(0);
      await expect(a).toBeFocused();
      const formatted = JSON.parse(await modelA.innerText());
      expect(formatted.children[0].children).toEqual([{ text: 'main' }]);
      expect(formatted.roots.note[0].children).toEqual([
        { bold: true, text: 'note' },
      ]);

      await copy.click();
      await copy.press('ControlOrMeta+End');
      await copy.pressSequentially('x');
      await expect(a).toHaveText('notex');
      await undo.click();
      await expect(copy).toHaveText('note');
      await expect(copy).toBeFocused();
      await redo.click();
      await expect(copy).toHaveText('notex');
      await expect(copy).toBeFocused();

      await b.click();
      await b.press('ControlOrMeta+End');
      await b.pressSequentially('b');
      await expect(b).toHaveText('noteb');
      await undo.click();
      await expect(b).toHaveText('note');
      await expect(b).toBeFocused();
      await expect(copy).toHaveText('notex');
      await expect
        .poll(() =>
          b.evaluate((element) => {
            const selection = window.getSelection();
            return {
              inside:
                !!selection?.anchorNode &&
                element.contains(selection.anchorNode),
              collapsed: selection?.isCollapsed,
              offset: selection?.anchorOffset,
            };
          })
        )
        .toEqual({ inside: true, collapsed: true, offset: 4 });

      await a.click();
      await a.press('ControlOrMeta+A');
      const font = page.getByRole('textbox', {
        name: 'Font size',
        exact: true,
      });
      await font.fill('24');
      await expect(font).toBeFocused();
      await page.keyboard.press('End');
      await page.keyboard.type('0');
      await expect(font).toHaveValue('240');
      await expect(a).toHaveText('notex');
      await page.keyboard.press('Backspace');
      await expect(font).toHaveValue('24');
      await b.click();
      await expect(modelA).toContainText('"fontSize":"24px"');
      await expect(modelB).not.toContainText('fontSize');
      await expect(b).toBeFocused();

      await a.click();
      await page.getByRole('button', { name: 'Toggle A read-only' }).click();
      await expect(a).toHaveAttribute('aria-readonly', 'true');
      await expect(bold).toBeDisabled();
      await copy.click();
      await copy.press('ControlOrMeta+End');
      await copy.pressSequentially('y');
      await expect(a).toHaveText('notexy');
      await page.getByRole('button', { name: 'Toggle A mount' }).click();
      await expect(a).toHaveCount(0);
      await expect(page.getByTestId('selected-view')).toHaveText('A copy');
      await page.getByRole('button', { name: 'Replace model A' }).click();
      await expect(copy).toHaveText('note');
      await expect(b).toHaveText('note');
      await copy.click();
      await copy.press('ControlOrMeta+End');
      await copy.pressSequentially('z');
      await expect(copy).toHaveText('notez');
      await expect(b).toHaveText('note');
      errors.assertNone();
      await testInfo.attach('mounted-views', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
      await expect(copy).toHaveText('notez');
      await expect(copy).toBeFocused();
      await expect(b).toHaveText('note');
      errors.assertNone();
      await testInfo.attach('model-values', {
        body: JSON.stringify({
          a: JSON.parse(await modelA.innerText()),
          b: JSON.parse(await modelB.innerText()),
        }),
        contentType: 'application/json',
      });
    });
  }
}
