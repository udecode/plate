import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const rootSelector = '[data-plite-editor="true"][contenteditable="true"]';
const widths = (table: Locator) =>
  table
    .locator('col')
    .evaluateAll((cols) =>
      cols
        .slice(1)
        .map((col) => Number.parseFloat((col as HTMLElement).style.width))
    );
const drag = async (page: Page, handle: Locator, dx: number, dy = 0) => {
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) throw new Error('Expected a visible table resize handle.');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 5 });
  await page.mouse.up();
};

test('scoped cell coordinates follow spanning cells, column insertion and undo/redo', async ({
  page,
}, testInfo) => {
  const errors = recordPliteBrowserRuntimeErrors(page, { strict: true });
  try {
    await page.goto('/blocks/table-demo');
    const root = page.locator(rootSelector).first();
    const editor = createPliteBrowserEditorHarness(page, testInfo.title, root);
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    await editor.focus();
    await editor.selectAll();
    await editor.clipboard.pasteHtml(
      '<p>before</p><table><colgroup><col style="width:100px"><col style="width:100px"><col style="width:100px"></colgroup><tbody><tr><td rowspan="2">A</td><td colspan="2">B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table><p>after</p>'
    );
    const table = root.locator('table');
    await expect(table.locator('tr')).toHaveCount(2);
    const a = table.locator('td').filter({ hasText: /^A$/ });
    const b = table.locator('td').filter({ hasText: /^B$/ });
    const d = table.locator('td').filter({ hasText: /^D$/ });
    await expect(a).toHaveAttribute('rowspan', '2');
    await expect(b).toHaveAttribute('colspan', '2');
    await expect.poll(() => widths(table)).toEqual([100, 100, 100]);
    await drag(page, d.locator('[data-table-resize-handle="column-end"]'), 30);
    await expect.poll(() => widths(table)).toEqual([100, 100, 130]);
    await editor.undo();
    await expect.poll(() => widths(table)).toEqual([100, 100, 100]);
    await d.getByText('D', { exact: true }).click();
    await page
      .getByRole('button', { name: 'Insert column before', exact: true })
      .click();
    await expect(table.locator('col')).toHaveCount(5);
    const insertedWidths = await widths(table);
    await drag(page, d.locator('[data-table-resize-handle="column-end"]'), 25);
    await expect
      .poll(() => widths(table))
      .toEqual([...insertedWidths.slice(0, -1), insertedWidths.at(-1)! + 25]);
    await editor.undo();
    await expect.poll(() => widths(table)).toEqual(insertedWidths);
    await editor.undo();
    await expect.poll(() => widths(table)).toEqual([100, 100, 100]);
    await editor.redo();
    await expect.poll(() => widths(table)).toEqual(insertedWidths);
    errors.assertNone();
  } finally {
    await page.mouse.up();
    errors.stop();
  }
});

test('row index projection stays current after row insertion and movement of the table', async ({
  page,
}, testInfo) => {
  const errors = recordPliteBrowserRuntimeErrors(page, { strict: true });
  try {
    await page.goto('/blocks/table-demo');
    const root = page.locator(rootSelector).first();
    const editor = createPliteBrowserEditorHarness(page, testInfo.title, root);
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    await editor.focus();
    await editor.selectAll();
    await editor.clipboard.pasteHtml(
      '<p>before</p><table><tbody><tr><td>first</td><td>one</td></tr><tr><td>last</td><td>two</td></tr></tbody></table><p>after</p>'
    );
    const table = root.locator('table');
    await expect(table.locator('tr')).toHaveCount(2);
    const tableNode = table.locator(
      'xpath=ancestor::*[@data-plite-node-key][1]'
    );
    const originalPath = await tableNode.getAttribute('data-plite-path');
    await root.getByText('before', { exact: true }).click();
    await page.keyboard.press('Enter');
    await expect(tableNode).not.toHaveAttribute(
      'data-plite-path',
      originalPath!
    );
    const last = table.locator('tr').filter({ hasText: 'last' });
    await last.getByText('last', { exact: true }).click();
    await page
      .getByRole('button', { name: 'Insert row before', exact: true })
      .click();
    await expect(table.locator('tr')).toHaveCount(3);
    const first = table.locator('tr').first();
    const firstHeight = await first.evaluate(
      (el) => el.getBoundingClientRect().height
    );
    const oldHeight = await last.evaluate(
      (el) => el.getBoundingClientRect().height
    );
    await drag(
      page,
      last.locator('[data-table-resize-handle="row-end"]').first(),
      0,
      25
    );
    await expect
      .poll(() => last.evaluate((el) => el.getBoundingClientRect().height))
      .toBeGreaterThan(oldHeight + 20);
    await expect
      .poll(() => first.evaluate((el) => el.getBoundingClientRect().height))
      .toBeCloseTo(firstHeight, 0);
    await editor.undo();
    await expect
      .poll(() => last.evaluate((el) => el.getBoundingClientRect().height))
      .toBeCloseTo(oldHeight, 0);
    await editor.undo();
    await expect(table.locator('tr')).toHaveCount(2);
    errors.assertNone();
  } finally {
    await page.mouse.up();
    errors.stop();
  }
});
