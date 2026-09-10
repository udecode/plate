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
const beginDrag = async (page: Page, handle: Locator, dx: number, dy = 0) => {
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error('Resize handle is not visible');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 5 });
};

for (const width of [1280, 390]) {
  test(`table resize previews, commits, and undoes at ${width}px`, async ({
    page,
  }, testInfo) => {
    const errors = recordPliteBrowserRuntimeErrors(page, { strict: true });
    try {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/blocks/table-demo');
      const root = page.locator(rootSelector).first();
      const editor = createPliteBrowserEditorHarness(
        page,
        testInfo.title,
        root
      );
      await editor.ready({ editor: 'visible', text: 'Plugin' });
      const table = root.locator('table');
      const original = await widths(table);
      await beginDrag(
        page,
        table.locator('[data-table-resize-handle="column-end"]').first(),
        30
      );
      await expect.poll(() => widths(table)).toEqual([130, 70, 100, 100]);
      await page.mouse.up();
      await expect.poll(() => widths(table)).toEqual([130, 70, 100, 100]);
      await page.screenshot({
        path: testInfo.outputPath('column-resized.png'),
      });
      await editor.undo();
      await expect.poll(() => widths(table)).toEqual(original);

      const row = table.locator('tr').first();
      const before = await row.evaluate(
        (el) => el.getBoundingClientRect().height
      );
      await beginDrag(
        page,
        row.locator('[data-table-resize-handle="row-end"]').first(),
        0,
        25
      );
      await page.mouse.up();
      await expect
        .poll(() => row.evaluate((el) => el.getBoundingClientRect().height))
        .toBeGreaterThan(before + 20);
      await editor.undo();
      await expect
        .poll(() => row.evaluate((el) => el.getBoundingClientRect().height))
        .toBeCloseTo(before, 0);
      errors.assertNone();
    } finally {
      await page.mouse.up();
      errors.stop();
    }
  });
}

test('table resize cancellation restores the rendered sizes', async ({
  page,
}, testInfo) => {
  const errors = recordPliteBrowserRuntimeErrors(page, { strict: true });
  try {
    await page.goto('/blocks/table-demo');
    const root = page.locator(rootSelector).first();
    const editor = createPliteBrowserEditorHarness(page, testInfo.title, root);
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    const table = root.locator('table');
    const original = await widths(table);
    const handle = table
      .locator('[data-table-resize-handle="column-end"]')
      .first();
    await handle.evaluate((el) =>
      el.addEventListener(
        'pointerdown',
        (event) => {
          el.setAttribute(
            'data-test-pointer-id',
            String((event as PointerEvent).pointerId)
          );
        },
        { once: true }
      )
    );
    await beginDrag(page, handle, 30);
    await expect.poll(() => widths(table)).toEqual([130, 70, 100, 100]);
    await handle.evaluate((el) =>
      el.dispatchEvent(
        new PointerEvent('pointercancel', {
          bubbles: true,
          pointerId: Number(el.getAttribute('data-test-pointer-id')),
        })
      )
    );
    await page.mouse.up();
    await expect.poll(() => widths(table)).toEqual(original);
    await expect(table.locator('[data-table-resizing]')).toHaveCount(0);
    errors.assertNone();
  } finally {
    await page.mouse.up();
    errors.stop();
  }
});

test('table toolbar commands preserve cell focus and border controls', async ({
  page,
}, testInfo) => {
  const errors = recordPliteBrowserRuntimeErrors(page, { strict: true });
  try {
    await page.goto('/blocks/table-demo');
    const root = page.locator(rootSelector).first();
    const editor = createPliteBrowserEditorHarness(page, testInfo.title, root);
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    const table = root.locator('table');
    await table.getByText('Heading', { exact: true }).click();
    await page
      .getByRole('button', { name: 'Insert row after', exact: true })
      .click();
    await expect(table.locator('tr')).toHaveCount(5);
    await editor.undo();
    await expect(table.locator('tr')).toHaveCount(4);
    await table.getByText('Heading', { exact: true }).click();
    await page
      .getByRole('button', { name: 'Cell borders', exact: true })
      .click();
    await expect(
      page.getByRole('menuitemcheckbox', { name: 'Top Border', exact: true })
    ).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('border-controls.png') });
    await page
      .getByRole('menuitemcheckbox', { name: 'Top Border', exact: true })
      .click();
    await editor.type('x');
    await expect(table).toContainText('x');
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('large tables defer column layout until pointer release', async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  const errors = recordPliteBrowserRuntimeErrors(page, { strict: true });
  try {
    await page.goto('/blocks/table-demo');
    const root = page.locator(rootSelector).first();
    const editor = createPliteBrowserEditorHarness(page, testInfo.title, root);
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    await editor.focus();
    await editor.selectAll();
    const rows = Array.from(
      { length: 301 },
      (_row, row) =>
        `<tr>${Array.from({ length: 4 }, (_, col) => `<td>R${row}C${col}</td>`).join('')}</tr>`
    ).join('');
    await editor.clipboard.pasteHtml(
      `<table><colgroup>${'<col style="width:100px">'.repeat(4)}</colgroup><tbody>${rows}</tbody></table>`
    );
    const table = root.locator('table').first();
    await expect(table.locator('tr')).toHaveCount(301);
    await table.locator('tr').first().scrollIntoViewIfNeeded();
    const original = await widths(table);
    await beginDrag(
      page,
      table.locator('[data-table-resize-handle="column-end"]').first(),
      30
    );
    expect(await widths(table)).toEqual(original);
    await page.mouse.up();
    await expect
      .poll(() => widths(table))
      .toEqual([original[0] + 30, original[1] - 30, ...original.slice(2)]);
    await page.screenshot({
      path: testInfo.outputPath('large-table-resized.png'),
    });
    errors.assertNone();
  } finally {
    await page.mouse.up();
    errors.stop();
  }
});
