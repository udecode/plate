import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 180 } });

test('read-only footnotes scroll, flash and focus jump controls without moving the selection [EDIT-FOOTNOTE-NAV-001] [EDIT-FOOTNOTE-NAV-002]', async ({
  page,
}, testInfo) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  try {
    await page.goto('/blocks/footnote-demo', { waitUntil: 'commit' });
    const editor = page.locator('[data-editor="true"]').first();
    const harness = createBrowserEditorHarness(page, testInfo.title, editor);
    await harness.ready({ editor: 'visible', text: 'Footnotes' });
    await editor.locator('[data-editor-string="true"]').first().click();
    await page.keyboard.press('ArrowRight');
    await page
      .getByRole('button', { name: 'Editing mode: Editing', exact: true })
      .click();
    await page
      .getByRole('menuitemradio', { name: 'Viewing', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: 'Editing mode: Viewing', exact: true })
    ).toBeVisible();
    await expect(editor).toHaveAttribute('aria-readonly', 'true');
    const before = await harness.get.selection();
    expect(before).not.toBeNull();
    const value = await harness.get.modelBlockTexts();
    const chip = editor
      .getByRole('button', { name: '[1]', exact: true })
      .first();
    const definition = editor.locator('.editor-footnoteDefinition').first();
    const start = definition.locator('[data-editor-string="true"]').first();
    const back = definition.getByRole('button', {
      name: 'Back to reference 1',
      exact: true,
    });
    await chip.evaluate((element) => element.scrollIntoView({ block: 'end' }));
    await expect
      .poll(async () => {
        const box = await start.boundingBox();
        return box?.y;
      })
      .toBeGreaterThanOrEqual(180);
    await chip.click();
    await expect(definition).toHaveAttribute('data-nav-target', 'true');
    await expect
      .poll(async () => {
        const box = await start.boundingBox();
        return !!box && box.y >= 44 && box.y + box.height <= 180;
      })
      .toBe(true);
    expect(await harness.get.selection()).toEqual(before);
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
    const picker = page.getByRole('dialog');
    await expect(picker).toBeVisible();
    await expect
      .poll(() =>
        picker.evaluate((element) => element.contains(document.activeElement))
      )
      .toBe(true);
    await expect(page.getByRole('option').first()).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option').nth(1)).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await page.keyboard.press('Enter');
    await expect(picker).toHaveCount(0);
    const secondChip = editor
      .getByRole('button', { name: '[1]', exact: true })
      .nth(1);
    await expect(secondChip).toBeFocused();
    await expect(secondChip.locator('..')).toHaveAttribute(
      'data-nav-target',
      'true'
    );
    expect(await harness.get.selection()).toEqual(before);
    expect(await harness.get.modelBlockTexts()).toEqual(value);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
