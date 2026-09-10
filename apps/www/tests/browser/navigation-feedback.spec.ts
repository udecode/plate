import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test.describe(`navigation feedback ${viewport.width}px`, () => {
    test.use({ viewport });

    test('TOC flashes the destination, repeats, expires and preserves editing', async ({
      page,
    }, testInfo) => {
      const errors = recordPliteBrowserRuntimeErrors(page);
      try {
        await page.goto('/blocks/toc-demo', { waitUntil: 'commit' });
        const editor = page.locator('[data-plite-editor="true"]').first();
        const harness = createPliteBrowserEditorHarness(
          page,
          testInfo.title,
          editor
        );
        await harness.ready({
          editor: 'visible',
          text: 'Benefits of Using TOC',
        });
        await expect(editor).toHaveAttribute('contenteditable', 'true');
        const initial = await harness.get.modelBlockTexts();
        const heading = editor.getByRole('heading', {
          name: /^Benefits of Using TOC/,
        });
        const link = editor.getByRole('button', {
          name: 'Benefits of Using TOC',
          exact: true,
        });

        await link.click();
        await expect(heading).toHaveAttribute('data-nav-target', 'true');
        await expect(heading).toHaveClass(/bg-\(--color-highlight\)/);
        const firstPulse = Number(await heading.getAttribute('data-nav-pulse'));
        await expect
          .poll(async () => {
            const box = await heading.boundingBox();
            return (
              !!box && box.y >= 44 && box.y + box.height <= viewport.height
            );
          })
          .toBe(true);
        await page.screenshot({ path: testInfo.outputPath('toc-target.png') });
        await link.click();
        await expect(heading).toHaveAttribute(
          'data-nav-pulse',
          String(firstPulse + 1)
        );
        expect(await harness.get.modelBlockTexts()).toEqual(initial);
        await expect(heading).not.toHaveAttribute('data-nav-target', 'true', {
          timeout: 3500,
        });
        await expect(heading).not.toHaveClass(/bg-\(--color-highlight\)/);

        const headingText = heading.locator('[data-plite-string="true"]');
        const headingBox = await headingText.boundingBox();
        expect(headingBox).not.toBeNull();
        await headingText.click({
          position: {
            x: Math.max(1, (headingBox?.width ?? 1) - 1),
            y: Math.max(1, (headingBox?.height ?? 1) / 2),
          },
        });
        await expect
          .poll(() =>
            headingText.evaluate((element) => {
              const selection = getSelection();
              return (
                !!selection?.anchorNode &&
                element.contains(selection.anchorNode) &&
                selection.anchorOffset === element.textContent?.length
              );
            })
          )
          .toBe(true);
        await page.keyboard.type('!');
        await expect(heading).toHaveText('Benefits of Using TOC!');
        await page.keyboard.press('ControlOrMeta+z');
        await expect(heading).toHaveText('Benefits of Using TOC');
        expect(await harness.get.modelBlockTexts()).toEqual(initial);

        if (viewport.width === 1280) {
          await page
            .getByRole('button', { name: 'Editing', exact: true })
            .click();
          await page
            .getByRole('menuitemradio', { name: 'Viewing', exact: true })
            .click();
          await expect(
            page.getByRole('button', { name: 'Viewing', exact: true })
          ).toBeVisible();
          await link.click();
          await expect(heading).toHaveAttribute('data-nav-target', 'true');
          expect(await harness.get.modelBlockTexts()).toEqual(initial);
        }
        errors.assertNone();
      } finally {
        errors.stop();
      }
    });

    test('footnote navigation keeps exact selection, focus, final scroll and follow-up history', async ({
      page,
    }, testInfo) => {
      const errors = recordPliteBrowserRuntimeErrors(page);
      try {
        await page.goto('/blocks/footnote-demo', { waitUntil: 'commit' });
        const editor = page.locator('[data-plite-editor="true"]').first();
        const harness = createPliteBrowserEditorHarness(
          page,
          testInfo.title,
          editor
        );
        await harness.ready({ editor: 'visible', text: 'Footnotes' });
        await expect(editor).toHaveAttribute('contenteditable', 'true');
        const initial = await harness.get.modelBlockTexts();
        const definition = editor.locator('.plite-footnoteDefinition').first();
        const definitionBody = definition
          .locator('[data-plite-string="true"]')
          .first();

        await editor
          .getByRole('button', { name: '[1]', exact: true })
          .first()
          .click({
            modifiers: ['ControlOrMeta'],
          });
        await expect(definition).toHaveAttribute('data-nav-target', 'true');
        await expect(editor).toBeFocused();
        await expect
          .poll(() =>
            definitionBody.evaluate((element) => {
              const selection = getSelection();
              return {
                inside:
                  !!selection?.anchorNode &&
                  element.contains(selection.anchorNode),
                offset: selection?.anchorOffset,
              };
            })
          )
          .toEqual({ inside: true, offset: 0 });
        await expect
          .poll(async () => {
            const box = await definitionBody.boundingBox();
            return (
              !!box && box.y >= 44 && box.y + box.height <= viewport.height
            );
          })
          .toBe(true);
        await page.screenshot({
          path: testInfo.outputPath('footnote-definition.png'),
        });
        await page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve())
              );
            })
        );
        await expect(editor).toBeFocused();
        await page.keyboard.type('X');
        await expect(definitionBody).toHaveText(
          'XFootnote definitions keep block content and their ref.'
        );
        await page.keyboard.press('ControlOrMeta+z');
        await expect(definitionBody).toHaveText(
          'Footnote definitions keep block content and their ref.'
        );
        expect(await harness.get.modelBlockTexts()).toEqual(initial);

        await editor
          .getByRole('button', { name: 'Back to reference 1', exact: true })
          .click();
        await page
          .getByRole('option', {
            name: '2 Multiple references can point to the same definition.',
            exact: true,
          })
          .click();
        await expect(page.getByRole('dialog')).toHaveCount(0);
        const reference = editor
          .locator('sup')
          .filter({
            has: page.getByRole('button', { name: '[1]', exact: true }),
          })
          .last();
        await expect(reference).toHaveAttribute('data-nav-target', 'true');
        await expect(editor).toBeFocused();
        await page.screenshot({
          path: testInfo.outputPath('footnote-reference.png'),
        });
        await page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve())
              );
            })
        );
        await expect(editor).toBeFocused();
        await page.keyboard.type('X');
        await expect(editor.getByText('X.', { exact: true })).toBeVisible();
        await page.keyboard.press('ControlOrMeta+z');
        expect(await harness.get.modelBlockTexts()).toEqual(initial);

        await editor
          .getByRole('button', { name: '[3]', exact: true })
          .click({ modifiers: ['ControlOrMeta'] });
        const thirdDefinition = editor
          .locator('.plite-footnoteDefinition')
          .nth(1);
        await expect(thirdDefinition).toHaveAttribute(
          'data-nav-target',
          'true'
        );
        await editor
          .getByRole('button', { name: 'Back to reference 3', exact: true })
          .click();
        await expect(
          editor.locator('sup').filter({
            has: page.getByRole('button', { name: '[3]', exact: true }),
          })
        ).toHaveAttribute('data-nav-target', 'true');
        await expect(editor).toBeFocused();
        expect(await harness.get.modelBlockTexts()).toEqual(initial);
        errors.assertNone();
      } finally {
        errors.stop();
      }
    });
  });
}
