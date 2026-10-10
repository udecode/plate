import { expect, test, type Page } from '@playwright/test';

import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';

test.use({ viewport: { width: 1280, height: 1200 } });

const selectedTexts = (page: Page) =>
  page
    .locator('[data-slot="node-selection-highlight"]')
    .evaluateAll((elements) =>
      elements.map((el) => el.parentElement?.textContent)
    );
const selectRow = async (page: Page, text: string, shift = false) => {
  const row = page.getByText(text, { exact: true });
  await row.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' })
  );
  await row.hover();
  const box = await row.boundingBox();
  if (!box) throw new Error('Missing body row');
  if (shift) await page.keyboard.down('Shift');
  await page.mouse.move(box.x - 100, box.y + 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 65, box.y + box.height - 2, { steps: 10 });
  await page.mouse.up();
  if (shift) await page.keyboard.up('Shift');
};
for (const { route, bodyText, title } of [
  {
    route: '/blocks/details-demo',
    bodyText:
      'The document model matches native HTML and keeps body blocks nested.',
    title: 'Why use semantic Details?',
  },
  {
    route: '/blocks/playground',
    bodyText: 'Keep extra context, notes, or answers in a collapsible block.',
    title: 'Expand to explore Details',
  },
]) {
  test.describe(route, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto(route);
      await page
        .getByRole('button', { name: 'Expand details', exact: true })
        .first()
        .click();
      await page.getByText(bodyText, { exact: true }).click();
      await page.keyboard.press('End');
      for (const text of ['select-one', 'select-two', 'select-three']) {
        await page.keyboard.press('Enter');
        await page.keyboard.type(text);
      }
      await selectRow(page, 'select-two');
      await expect.poll(() => selectedTexts(page)).toEqual(['select-two']);
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.rangeCount ?? 0))
        .toBe(0);
    });
    test('plain and shift arrows preserve Details block selection', async ({
      page,
    }, info) => {
      const errors = recordBrowserRuntimeErrors(page);
      const expectBlocks = async (texts: string[]) => {
        await expect.poll(() => selectedTexts(page)).toEqual(texts);
        await expect
          .poll(() =>
            page.evaluate(() => window.getSelection()?.rangeCount ?? 0)
          )
          .toBe(0);
        await expect(
          page.locator('[data-editor="true"][contenteditable="true"]').first()
        ).toBeFocused();
      };
      try {
        for (const [key, texts] of [
          ['ArrowDown', ['select-three']],
          ['ArrowUp', ['select-two']],
          ['ArrowUp', ['select-one']],
          ['ArrowDown', ['select-two']],
        ] as const) {
          await page.keyboard.press(key);
          await expectBlocks([...texts]);
        }
        await page.screenshot({ path: info.outputPath('plain-selected.png') });
        await page.keyboard.press('Shift+ArrowDown');
        await expectBlocks(['select-two', 'select-three']);
        await page.screenshot({ path: info.outputPath('shift-expanded.png') });
        await page.keyboard.press('ArrowUp');
        await expectBlocks(['select-two']);
        await page.keyboard.press('Shift+ArrowDown');
        await expectBlocks(['select-two', 'select-three']);
        await page.keyboard.press('Shift+ArrowUp');
        await expectBlocks(['select-two']);
        await page.keyboard.press('Shift+ArrowUp');
        await expectBlocks(['select-one', 'select-two']);
        await page.keyboard.press('Backspace');
        await expect(page.getByText('select-one', { exact: true })).toHaveCount(
          0
        );
        await expect(page.getByText('select-two', { exact: true })).toHaveCount(
          0
        );
        await expect(
          page.getByText('select-three', { exact: true })
        ).toBeVisible();
        await expect(page.getByText(title, { exact: true })).toBeVisible();
        await page.keyboard.press('ControlOrMeta+z');
        await expect(
          page.getByText('select-one', { exact: true })
        ).toBeVisible();
        await expect(
          page.getByText('select-two', { exact: true })
        ).toBeVisible();
        await selectRow(page, bodyText);
        await page.keyboard.press('Shift+ArrowUp');
        await expectBlocks([bodyText]);
        await page.keyboard.press('ArrowDown');
        await expectBlocks(['select-one']);
        await page.keyboard.press('ArrowUp');
        await expectBlocks([bodyText]);
        await page.keyboard.press('ArrowUp');
        await expectBlocks([bodyText]);
        const details = page
          .getByText(title, { exact: true })
          .locator('xpath=ancestor::*[contains(@class,"editor-details ")][1]');
        const detailsText = await details.textContent();
        if (detailsText === null) throw new Error('Missing Details content');
        await selectRow(page, title);
        await expectBlocks([detailsText]);
        await page.keyboard.press('ArrowDown');
        await expectBlocks([
          route.endsWith('details-demo')
            ? 'Content after Details remains an ordinary sibling block.'
            : 'Multi-column Layout',
        ]);
        await page.keyboard.press('ArrowUp');
        await expectBlocks([detailsText]);
        errors.assertNone();
      } finally {
        errors.stop();
      }
    });
    test('context menu preserves selected blocks and retargets unselected blocks', async ({
      page,
    }, info) => {
      const errors = recordBrowserRuntimeErrors(page);
      try {
        await selectRow(page, 'select-one', true);
        await expect
          .poll(() => selectedTexts(page))
          .toEqual(['select-one', 'select-two']);
        await page
          .getByText('select-two', { exact: true })
          .click({ button: 'right' });
        await expect(
          page.getByRole('menuitem', { name: 'Duplicate', exact: true })
        ).toBeVisible();
        await expect
          .poll(() => selectedTexts(page))
          .toEqual(['select-one', 'select-two']);
        await page.screenshot({ path: info.outputPath('menu-preserved.png') });
        await page
          .getByRole('menuitem', { name: 'Duplicate', exact: true })
          .click();
        await expect(page.getByText('select-one', { exact: true })).toHaveCount(
          2
        );
        await expect(page.getByText('select-two', { exact: true })).toHaveCount(
          2
        );
        await expect(
          page.locator('[data-editor="true"][contenteditable="true"]').first()
        ).toBeFocused();
        await page.keyboard.press('ControlOrMeta+z');
        await expect(page.getByText('select-one', { exact: true })).toHaveCount(
          1
        );
        await expect(page.getByText('select-two', { exact: true })).toHaveCount(
          1
        );
        await expect
          .poll(() => selectedTexts(page))
          .toEqual(['select-one', 'select-two']);
        await page.getByText('select-two', { exact: true }).hover();
        const handle = page
          .getByText('select-two', { exact: true })
          .locator('xpath=ancestor::*[contains(@class,"editor-draggable")][1]')
          .getByRole('button', { name: 'Drag block', exact: true });
        await handle.click({ button: 'right' });
        await expect(
          page.getByRole('menuitem', { name: 'Duplicate', exact: true })
        ).toBeVisible();
        await expect
          .poll(() => selectedTexts(page))
          .toEqual(['select-one', 'select-two']);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('menu')).toHaveCount(0);
        await expect(
          page.locator('[data-editor="true"][contenteditable="true"]').first()
        ).toBeFocused();
        await page
          .getByText('select-three', { exact: true })
          .click({ button: 'right' });
        await expect.poll(() => selectedTexts(page)).toEqual(['select-three']);
        await page
          .getByRole('menuitem', { name: 'Delete', exact: true })
          .click();
        await expect(
          page.getByText('select-three', { exact: true })
        ).toHaveCount(0);
        await expect(
          page.getByText('select-one', { exact: true })
        ).toBeVisible();
        await expect(page.getByRole('menu')).toHaveCount(0);
        await expect(
          page.locator('[data-editor="true"][contenteditable="true"]').first()
        ).toBeFocused();
        await selectRow(page, 'select-two');
        await page.getByText('select-one', { exact: true }).hover();
        await page
          .getByText('select-one', { exact: true })
          .locator('xpath=ancestor::*[contains(@class,"editor-draggable")][1]')
          .getByRole('button', { name: 'Drag block', exact: true })
          .click({ button: 'right' });
        await expect.poll(() => selectedTexts(page)).toEqual(['select-one']);
        await page
          .getByRole('menuitem', { name: 'Delete', exact: true })
          .click();
        await expect(page.getByText('select-one', { exact: true })).toHaveCount(
          0
        );
        await expect(
          page.getByText('select-two', { exact: true })
        ).toBeVisible();
        errors.assertNone();
      } finally {
        errors.stop();
      }
    });
  });
}
