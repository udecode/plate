import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

const PAINT_CASE_ID = 'table:hide-native-highlight-during-multi-cell-drag';
const ROW_HANDLE_PAINT_CASE_ID = 'table:paint-row-handle-selection';
const CONTRACT_CASE_ID = 'table:contract-selection-on-drag-back';
const RESIZE_HANDLE_CASE_ID =
  'table:ignore-resize-handle-hover-during-cell-selection-drag';
const BLOCK_HANDLE_CASE_ID = 'table:hide-block-handles-during-cell-selection';
const CELL_ONLY_PAINT_CASE_ID = 'table:paint-only-selected-cells';
const CLIPBOARD_RECTANGLE_CASE_ID =
  'table:paste-copied-cell-rectangle-into-selected-cells';
const CLIPBOARD_CARET_CASE_ID =
  'table:paste-copied-cell-rectangle-at-caret-in-authored-playground';
const EDITOR_ROOT = '[data-editor="true"][contenteditable="true"]';

const isTransparent = (color: string) =>
  color === 'transparent' ||
  color === 'rgba(0, 0, 0, 0)' ||
  /\/\s*0\)$/.test(color);

type PixelImage = {
  data: number[];
  height: number;
  width: number;
};

const afterPaint = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );

const capturePixels = async (
  page: Page,
  clip: { height: number; width: number; x: number; y: number }
) => {
  const png = await page.screenshot({
    animations: 'disabled',
    caret: 'hide',
    clip,
  });
  const image = await page.evaluate(async (base64): Promise<PixelImage> => {
    const bytes = Uint8Array.from(atob(base64), (value) => value.charCodeAt(0));
    const bitmap = await createImageBitmap(
      new Blob([bytes], { type: 'image/png' })
    );
    const canvas = document.createElement('canvas');
    canvas.height = bitmap.height;
    canvas.width = bitmap.width;
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Unable to decode screenshot pixels');

    context.drawImage(bitmap, 0, 0);

    return {
      data: Array.from(
        context.getImageData(0, 0, bitmap.width, bitmap.height).data
      ),
      height: bitmap.height,
      width: bitmap.width,
    };
  }, png.toString('base64'));

  return { image, png };
};

const changedPixelCount = (left: PixelImage, right: PixelImage) => {
  expect(left.width).toBe(right.width);
  expect(left.height).toBe(right.height);

  let count = 0;

  for (let index = 0; index < left.data.length; index += 4) {
    const delta = Math.max(
      Math.abs(left.data[index] - right.data[index]),
      Math.abs(left.data[index + 1] - right.data[index + 1]),
      Math.abs(left.data[index + 2] - right.data[index + 2])
    );

    if (delta > 16) count += 1;
  }

  return count;
};

const setSelectionPaintControl = async (
  page: Page,
  background: null | string
) => {
  await page.evaluate((nextBackground) => {
    const id = 'table-selection-pixel-control';
    document.getElementById(id)?.remove();

    if (!nextBackground) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `*::selection { background: ${nextBackground} !important; }`;
    document.head.append(style);
  }, background);
  await afterPaint(page);
};

type TableSelectionLayerControl = 'absent' | 'actual' | 'duplicate' | 'single';

const setTableSelectionLayerControl = async (
  page: Page,
  control: TableSelectionLayerControl
) => {
  await page.evaluate((nextControl) => {
    const id = 'table-selection-layer-control';
    // Inert drag previews have no node keys; controls must target the live table.
    const table = document.querySelector(
      '[data-editor="true"] table:has(td[data-editor-node-key], th[data-editor-node-key])'
    );
    const wrapper = table?.parentElement;

    document.getElementById(id)?.remove();
    document.querySelector('[data-test-table-selection-duplicate]')?.remove();
    document
      .querySelector('[data-test-table-selection-control]')
      ?.removeAttribute('data-test-table-selection-control');

    if (!wrapper || nextControl === 'actual') return;

    wrapper.setAttribute('data-test-table-selection-control', nextControl);

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      [data-test-table-selection-control="single"] > [data-slot="node-selection-highlight"]:not([data-test-table-selection-duplicate]),
      [data-test-table-selection-control="duplicate"] > [data-slot="node-selection-highlight"]:not([data-test-table-selection-duplicate]) {
        display: none !important;
      }
      [data-test-table-selection-control="absent"] [data-slot="node-selection-highlight"] {
        display: none !important;
      }
      [data-test-table-selection-control="absent"] [data-table-cell-selected="true"]::before {
        display: none !important;
      }
    `;
    document.head.append(style);

    if (nextControl === 'duplicate') {
      const duplicate = document.createElement('div');

      duplicate.contentEditable = 'false';
      duplicate.dataset.editorRootChromeIgnore = 'true';
      duplicate.dataset.slot = 'node-selection-highlight';
      duplicate.dataset.testTableSelectionDuplicate = 'true';
      duplicate.style.backgroundColor = 'rgba(0, 92, 255, 0.35)';
      duplicate.style.inset = '0';
      duplicate.style.pointerEvents = 'none';
      duplicate.style.position = 'absolute';
      duplicate.style.zIndex = '1';
      wrapper.append(duplicate);
    }
  }, control);
  await afterPaint(page);
};

const visibleButtonCount = (page: Page, name: string) =>
  page.getByRole('button', { name }).evaluateAll(
    (handles) =>
      handles.filter((handle) => {
        let current: Element | null = handle;

        while (current) {
          const style = getComputedStyle(current);

          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            Number(style.opacity) === 0
          ) {
            return false;
          }

          current = current.parentElement;
        }

        return true;
      }).length
  );

const NON_ROW_DRAG_AFFORDANCE_LABELS = [
  'Drag block',
  'Move selected cells',
] as const;

const expectCellSelectionDragAffordances = async (
  page: Page,
  rowHandleCount: number
) => {
  for (const label of NON_ROW_DRAG_AFFORDANCE_LABELS) {
    await expect
      .poll(() => visibleButtonCount(page, label), {
        message: `${label} should be hidden during table cell selection`,
      })
      .toBe(0);
  }

  await expect
    .poll(() => visibleButtonCount(page, 'Select or move row'), {
      message: `Expected ${rowHandleCount} visible row handles during table cell selection`,
    })
    .toBe(rowHandleCount);
};

test(CLIPBOARD_RECTANGLE_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/table-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(
      page,
      CLIPBOARD_RECTANGLE_CASE_ID,
      root
    );
    const cells = root.locator(
      'table td[data-editor-node-key], table th[data-editor-node-key]'
    );
    const modelSelection = () =>
      root.evaluate((element) =>
        (
          element as HTMLElement & {
            __pliteBrowserHandle?: { getModelSelection: () => unknown };
          }
        ).__pliteBrowserHandle?.getModelSelection()
      );
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    await expect(cells).toHaveCount(16);

    const dragSelection = async (startIndex: number, endIndex: number) => {
      const start = await cells.nth(startIndex).boundingBox();
      const end = await cells.nth(endIndex).boundingBox();

      expect(start).not.toBeNull();
      expect(end).not.toBeNull();

      await page.mouse.move(start!.x + 30, start!.y + start!.height / 2);
      await page.mouse.down();
      await page.mouse.move(end!.x + 30, end!.y + end!.height / 2, {
        steps: 8,
      });
      await page.mouse.up();

      await expect
        .poll(() =>
          cells.evaluateAll(
            (elements) =>
              elements.filter((element) =>
                element.hasAttribute('data-table-cell-selected')
              ).length
          )
        )
        .toBe(4);
    };

    await dragSelection(0, 5);
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: expect.arrayContaining([
        [2, 0, 0],
        [2, 0, 1],
        [2, 1, 0],
        [2, 1, 1],
      ]),
    });
    const payload = await editor.clipboard.copyEventPayload();

    expect(payload.types).toContain('application/x-editor-fragment');
    expect(payload.text).toBe('Plugin\tElement\nHeading\t\n');
    const copiedSlice = JSON.parse(
      decodeURIComponent(atob(payload.fragment!))
    ) as {
      slice: { content: Array<{ children: Array<{ children: unknown[] }> }> };
    };

    expect(copiedSlice.slice.content[0]?.children).toHaveLength(2);
    expect(
      copiedSlice.slice.content[0]?.children.map((row) => row.children.length)
    ).toEqual([2, 2]);
    await expect.poll(modelSelection).toMatchObject({ kind: 'node' });
    await dragSelection(10, 15);
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: expect.arrayContaining([
        [2, 2, 2],
        [2, 2, 3],
        [2, 3, 2],
        [2, 3, 3],
      ]),
    });
    await editor.clipboard.pasteEventPayload(payload);

    await expect(root.locator('table')).toHaveCount(1);
    await expect(cells).toHaveCount(16);
    await expect(cells.nth(10)).toHaveText('Plugin');
    await expect(cells.nth(11)).toHaveText('Element');
    await expect(cells.nth(14)).toHaveText('Heading');
    await expect(cells.nth(15)).toHaveText('');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(CLIPBOARD_CARET_CASE_ID, async ({ context, page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/playground', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(
      page,
      CLIPBOARD_CARET_CASE_ID,
      root
    );
    await editor.ready({ editor: 'visible', text: 'How Plate Compares' });

    const table = root.locator('table').filter({ hasText: 'Feature' }).first();
    const cells = table.locator(
      'td[data-editor-node-key], th[data-editor-node-key]'
    );
    const modelSelection = () =>
      root.evaluate((element) =>
        (
          element as HTMLElement & {
            __pliteBrowserHandle?: { getModelSelection: () => unknown };
          }
        ).__pliteBrowserHandle?.getModelSelection()
      );

    await expect(cells).toHaveCount(24);
    runtimeErrors.reset();
    await cells.nth(4).scrollIntoViewIfNeeded();

    const sourceStart = await cells.nth(4).boundingBox();
    const sourceEnd = await cells.nth(0).boundingBox();

    expect(sourceStart).not.toBeNull();
    expect(sourceEnd).not.toBeNull();

    await page.mouse.move(
      sourceStart!.x + 30,
      sourceStart!.y + sourceStart!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      sourceEnd!.x + 30,
      sourceEnd!.y + sourceEnd!.height / 2,
      { steps: 8 }
    );
    await page.mouse.up();

    await expect
      .poll(() =>
        cells.evaluateAll(
          (elements) =>
            elements.filter((element) =>
              element.hasAttribute('data-table-cell-selected')
            ).length
        )
      )
      .toBe(4);
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: expect.arrayContaining([
        [15, 0, 0],
        [15, 0, 1],
        [15, 1, 0],
        [15, 1, 1],
      ]),
    });

    const payload = await editor.clipboard.copyNativeEventPayload();

    expect(payload.types).toContain('application/x-editor-fragment');
    expect(payload.text).toBe('Feature\tPlate (Free & OSS)\nAI\t✅\n');

    const modelChildren = async () =>
      ((await editor.get.modelValue()) as { children: unknown[] }).children;
    const historyDepth = async () => {
      const history = (await editor.get.history()) as {
        redos: unknown[];
        undos: unknown[];
      };

      return { redos: history.redos.length, undos: history.undos.length };
    };
    const beforePasteChildren = await modelChildren();
    const beforePasteHistory = await historyDepth();
    const target = await cells.nth(23).boundingBox();

    expect(target).not.toBeNull();

    await page.mouse.click(
      target!.x + target!.width / 2,
      target!.y + target!.height / 2
    );
    await page.keyboard.press('ControlOrMeta+V');

    await expect
      .poll(() => editor.get.lastCommit())
      .toMatchObject({
        tags: expect.arrayContaining(['paste', 'semantic-command']),
      });
    await expect(root.locator('table')).toHaveCount(1);
    await expect(table.locator('tr')).toHaveCount(9);
    await expect(cells).toHaveCount(36);
    await expect(table.locator(':scope > colgroup > col')).toHaveCount(5);
    await expect(cells.nth(30)).toHaveText('Feature');
    await expect(cells.nth(31)).toHaveText('Plate (Free & OSS)');
    await expect(cells.nth(34)).toHaveText('AI');
    await expect(cells.nth(35)).toHaveText('✅');
    await expect.poll(historyDepth).toEqual({
      redos: 0,
      undos: beforePasteHistory.undos + 1,
    });
    await expect
      .poll(() =>
        cells.evaluateAll(
          (elements) =>
            elements.filter((element) =>
              element.hasAttribute('data-table-cell-selected')
            ).length
        )
      )
      .toBe(4);

    const expandedWidths = await Promise.all(
      [30, 31, 34, 35].map(async (index) =>
        cells
          .nth(index)
          .evaluate((element) => element.getBoundingClientRect().width)
      )
    );

    expect(expandedWidths.every((width) => width >= 48)).toBe(true);

    const value = (await editor.get.modelValue()) as {
      children: Array<{
        columnWidths?: Array<number | null>;
        type?: string;
      }>;
    };
    const modelTable = value.children.find((node) => node.type === 'table');
    const afterPasteChildren = await modelChildren();

    expect(modelTable?.columnWidths).toHaveLength(4);

    await cells.nth(35).scrollIntoViewIfNeeded();
    await testInfo.attach('table-bottom-right-edge-paste', {
      body: await page.screenshot({ animations: 'disabled', caret: 'hide' }),
      contentType: 'image/png',
    });

    await page.keyboard.press('ControlOrMeta+z');
    await expect.poll(modelChildren).toEqual(beforePasteChildren);
    await expect.poll(historyDepth).toEqual({
      redos: 1,
      undos: beforePasteHistory.undos,
    });
    await expect(table.locator('tr')).toHaveCount(8);
    await expect(cells).toHaveCount(24);
    await expect(table.locator(':scope > colgroup > col')).toHaveCount(4);

    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect(table.locator('tr')).toHaveCount(9);
    await expect(cells).toHaveCount(36);
    await expect(cells.nth(30)).toHaveText('Feature');
    await expect(cells.nth(31)).toHaveText('Plate (Free & OSS)');
    await expect(cells.nth(34)).toHaveText('AI');
    await expect(cells.nth(35)).toHaveText('✅');
    await expect.poll(modelChildren).toEqual(afterPasteChildren);
    await expect.poll(historyDepth).toEqual({
      redos: 0,
      undos: beforePasteHistory.undos + 1,
    });

    await cells.nth(35).click();
    await page.keyboard.type('edge');
    await expect(cells.nth(35)).toContainText('edge');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(CELL_ONLY_PAINT_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/table-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(
      page,
      CELL_ONLY_PAINT_CASE_ID,
      root
    );
    const cells = root.locator(
      'table td[data-editor-node-key], table th[data-editor-node-key]'
    );
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    await expect(cells).toHaveCount(16);

    const paintLayers = () =>
      root.evaluate((element) => {
        const table = element.querySelector(
          'table:has(td[data-editor-node-key], th[data-editor-node-key])'
        );
        const wrapper = table?.parentElement;
        const layers = Array.from(
          element.querySelectorAll('[data-slot="node-selection-highlight"]')
        );

        return {
          cell: layers.filter((layer) => layer.parentElement?.matches('td,th'))
            .length,
          selected: table?.querySelectorAll('[data-table-cell-selected="true"]')
            .length,
          table: wrapper
            ? wrapper.querySelectorAll(
                ':scope > [data-slot="node-selection-highlight"]'
              ).length
            : -1,
        };
      });

    await cells.nth(0).click();
    await root.press('ControlOrMeta+A');
    expect(await editor.get.selection()).not.toBeNull();

    await expect.poll(paintLayers).toEqual({ cell: 0, selected: 16, table: 0 });
    await expect
      .poll(() =>
        page.locator('[data-radix-popper-content-wrapper]').evaluateAll(
          (elements) =>
            elements.filter((element) => {
              const style = getComputedStyle(element);

              return (
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                Number(style.opacity) !== 0
              );
            }).length
        )
      )
      .toBe(1);

    const clip = await root
      .locator('table:has(td[data-editor-node-key], th[data-editor-node-key])')
      .first()
      .evaluate((table) => {
        const rect = table.parentElement!.getBoundingClientRect();

        return {
          height: Math.ceil(rect.bottom) - Math.floor(rect.top),
          width: Math.ceil(rect.right) - Math.floor(rect.left),
          x: Math.floor(rect.left + window.scrollX),
          y: Math.floor(rect.top + window.scrollY),
        };
      });
    const actual = await capturePixels(page, clip);

    await setTableSelectionLayerControl(page, 'single');
    const single = await capturePixels(page, clip);

    await setTableSelectionLayerControl(page, 'absent');
    const absentA = await capturePixels(page, clip);
    const absentB = await capturePixels(page, clip);

    await setTableSelectionLayerControl(page, 'duplicate');
    const duplicate = await capturePixels(page, clip);

    for (const [name, capture] of [
      ['table-selection-actual', actual],
      ['table-selection-single-control', single],
      ['table-selection-absent-control', absentA],
      ['table-selection-duplicate-control', duplicate],
    ] as const) {
      await testInfo.attach(name, {
        body: capture.png,
        contentType: 'image/png',
      });
    }

    const positiveSignal = changedPixelCount(single.image, absentA.image);
    const negativeSignal = changedPixelCount(absentA.image, absentB.image);
    const duplicateSignal = changedPixelCount(duplicate.image, single.image);
    const actualSignal = changedPixelCount(actual.image, single.image);
    const allowedSignal = Math.max(
      20,
      negativeSignal * 4,
      Math.floor(Math.min(positiveSignal, duplicateSignal) * 0.02)
    );

    expect(
      positiveSignal,
      'positive-control: selected-cell paint detected'
    ).toBeGreaterThan(200);
    expect(
      negativeSignal,
      'negative-control: absent selection paint is stable'
    ).toBeLessThanOrEqual(20);
    expect(
      duplicateSignal,
      'duplicate-control: extra table-wide paint detected'
    ).toBeGreaterThan(200);
    expect(
      actualSignal,
      'selected table paint matches the cell-only control'
    ).toBeLessThanOrEqual(allowedSignal);

    await setTableSelectionLayerControl(page, 'actual');
    await testInfo.attach('table-selection-pixel-signals', {
      body: Buffer.from(
        JSON.stringify({
          actualSignal,
          allowedSignal,
          duplicateSignal,
          negativeSignal,
          positiveSignal,
        })
      ),
      contentType: 'application/json',
    });

    const originalText = await editor.get.modelText();

    await cells.nth(0).click();
    await page.keyboard.press('End');
    await page.keyboard.type('x');
    await expect(cells.nth(0)).toHaveText('Pluginx');
    await page.keyboard.press('ControlOrMeta+z');
    await expect.poll(() => editor.get.modelText()).toBe(originalText);

    runtimeErrors.assertNone();
  } finally {
    await setTableSelectionLayerControl(page, 'actual');
    await page.mouse.up();
    runtimeErrors.stop();
  }
});

test(BLOCK_HANDLE_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/table-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(page, BLOCK_HANDLE_CASE_ID, root);
    const cells = root.locator(
      'table td[data-editor-node-key], table th[data-editor-node-key]'
    );
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    await expect(cells).toHaveCount(16);

    const start = await cells.nth(0).boundingBox();
    const sameRowEnd = await cells.nth(1).boundingBox();
    const multiRowEnd = await cells.nth(4).boundingBox();

    expect(start).not.toBeNull();
    expect(sameRowEnd).not.toBeNull();
    expect(multiRowEnd).not.toBeNull();

    const startPoint = {
      x: start!.x + 30,
      y: start!.y + start!.height / 2,
    };
    const sameRowEndPoint = {
      x: sameRowEnd!.x + 30,
      y: sameRowEnd!.y + sameRowEnd!.height / 2,
    };
    const multiRowEndPoint = {
      x: multiRowEnd!.x + 30,
      y: multiRowEnd!.y + multiRowEnd!.height / 2,
    };
    const selectedCellCount = () =>
      cells.evaluateAll(
        (elements) =>
          elements.filter((element) =>
            element.hasAttribute('data-table-cell-selected')
          ).length
      );

    await page.evaluate(() => {
      document.addEventListener(
        'pointermove',
        (event) => {
          const pointerEvent = event;
          const htmlElement = document.documentElement;

          htmlElement.setAttribute(
            'data-test-last-pointer-buttons',
            String(pointerEvent.buttons)
          );
          htmlElement.setAttribute('data-test-last-pointer-event', event.type);
          htmlElement.setAttribute(
            'data-test-last-pointer-target',
            (event.target as Element).closest('td,th')?.tagName ?? 'unknown'
          );
        },
        { capture: true }
      );
    });

    await page.mouse.move(startPoint.x, startPoint.y);
    await expect.poll(() => visibleButtonCount(page, 'Drag block')).toBe(1);
    await page.mouse.down();

    try {
      await page.mouse.move(sameRowEndPoint.x, sameRowEndPoint.y, { steps: 8 });
      await expect.poll(selectedCellCount).toBe(2);
      await expectCellSelectionDragAffordances(page, 1);
    } finally {
      await page.mouse.up();
    }

    await expect.poll(selectedCellCount).toBe(2);
    await expectCellSelectionDragAffordances(page, 1);

    await page.mouse.move(startPoint.x, startPoint.y);
    await page.mouse.down();

    try {
      await page.mouse.move(multiRowEndPoint.x, multiRowEndPoint.y, {
        steps: 8,
      });
      await expect.poll(selectedCellCount).toBe(2);
      await expectCellSelectionDragAffordances(page, 0);
      const documentRoot = page.locator('html');

      await expect(documentRoot).toHaveAttribute(
        'data-test-last-pointer-buttons',
        '1'
      );
      await expect(documentRoot).toHaveAttribute(
        'data-test-last-pointer-event',
        'pointermove'
      );
      await expect(documentRoot).toHaveAttribute(
        'data-test-last-pointer-target',
        'TD'
      );
    } finally {
      await page.mouse.up();
    }

    await expect.poll(selectedCellCount).toBe(2);
    await expectCellSelectionDragAffordances(page, 0);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(ROW_HANDLE_PAINT_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/table-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(
      page,
      ROW_HANDLE_PAINT_CASE_ID,
      root
    );
    const rowHandles = root.getByRole('button', {
      name: 'Select or move row',
    });
    const selectedCells = root.locator(
      'table td[data-table-cell-selected="true"], table th[data-table-cell-selected="true"]'
    );
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    await expect(rowHandles).toHaveCount(4);

    await rowHandles.nth(1).click();
    await expect(selectedCells).toHaveCount(4);
    await expect(selectedCells).toHaveText(['Heading', '', '', 'No']);
    const displayedSelection = await editor.get.displayedSelection();

    expect(displayedSelection.model).not.toBeNull();
    expect(displayedSelection.native.rangeCount).toBe(1);
    expect(displayedSelection.native.textLength).toBeGreaterThan(0);
    expect(
      isTransparent(
        await selectedCells
          .first()
          .evaluate(
            (element) => getComputedStyle(element, '::before').backgroundColor
          )
      )
    ).toBe(false);
    await rowHandles.nth(2).click();

    await expect(selectedCells).toHaveText(['Image', 'Yes', 'No', 'Yes']);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(PAINT_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/table-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(page, PAINT_CASE_ID, root);
    const cells = root.locator(
      'table td[data-editor-node-key], table th[data-editor-node-key]'
    );
    const startText = cells
      .nth(0)
      .locator('[data-editor-string="true"]')
      .first();
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    await expect(cells).toHaveCount(16);

    const start = await cells.nth(0).boundingBox();
    const end = await cells.nth(4).boundingBox();

    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    expect(
      isTransparent(
        await startText.evaluate(
          (element) => getComputedStyle(element, '::selection').backgroundColor
        )
      )
    ).toBe(false);

    await page.mouse.move(start!.x + 30, start!.y + start!.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(50);

    try {
      for (let step = 1; step <= 8; step++) {
        const progress = step / 8;

        await page.mouse.move(
          start!.x + 30 + (end!.x + 30 - (start!.x + 30)) * progress,
          start!.y +
            start!.height / 2 +
            (end!.y + end!.height / 2 - (start!.y + start!.height / 2)) *
              progress
        );
        await page.waitForTimeout(40);
      }

      await expect
        .poll(() =>
          cells.evaluateAll((elements) => ({
            nativeText: window.getSelection()?.toString() ?? '',
            selectedCount: elements.filter((element) =>
              element.hasAttribute('data-table-cell-selected')
            ).length,
          }))
        )
        .toEqual({
          nativeText: expect.stringContaining('Element'),
          selectedCount: 2,
        });

      const selectionBackgrounds = await cells.evaluateAll((elements) =>
        elements
          .filter((element) => element.hasAttribute('data-table-cell-selected'))
          .map((element) => {
            const text =
              element.querySelector('[data-editor-string="true"]') ?? element;

            return getComputedStyle(text, '::selection').backgroundColor;
          })
      );

      expect(selectionBackgrounds).toHaveLength(2);
      expect(selectionBackgrounds.every(isTransparent)).toBe(true);

      const rangeRects = await page.evaluate(() => {
        const selection = window.getSelection();

        if (!selection?.rangeCount) return [];

        return Array.from(selection.getRangeAt(0).getClientRects()).map(
          (rect) => ({
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX,
            top: rect.top + window.scrollY,
          })
        );
      });

      expect(rangeRects.length).toBeGreaterThan(1);

      const clip = {
        height:
          Math.ceil(Math.max(...rangeRects.map((box) => box.bottom))) -
          Math.floor(Math.min(...rangeRects.map((box) => box.top))) +
          8,
        width:
          Math.ceil(Math.max(...rangeRects.map((box) => box.right))) -
          Math.floor(Math.min(...rangeRects.map((box) => box.left))) +
          8,
        x: Math.floor(Math.min(...rangeRects.map((box) => box.left))) - 4,
        y: Math.floor(Math.min(...rangeRects.map((box) => box.top))) - 4,
      };
      const actual = await capturePixels(page, clip);

      await setSelectionPaintControl(page, 'transparent');
      const negativeA = await capturePixels(page, clip);
      const negativeB = await capturePixels(page, clip);

      await setSelectionPaintControl(page, 'rgb(0 92 255)');
      const positive = await capturePixels(page, clip);
      await setSelectionPaintControl(page, null);

      await testInfo.attach('held-selection-actual', {
        body: actual.png,
        contentType: 'image/png',
      });
      await testInfo.attach('held-selection-negative-control', {
        body: negativeA.png,
        contentType: 'image/png',
      });
      await testInfo.attach('held-selection-positive-control', {
        body: positive.png,
        contentType: 'image/png',
      });

      const positiveSignal = changedPixelCount(positive.image, negativeA.image);
      const negativeSignal = changedPixelCount(
        negativeA.image,
        negativeB.image
      );
      const actualSignal = changedPixelCount(actual.image, negativeA.image);
      const allowedSignal = Math.max(
        20,
        negativeSignal * 4,
        Math.floor(positiveSignal * 0.02)
      );

      expect(
        positiveSignal,
        'positive-control: native highlight detected'
      ).toBeGreaterThan(200);
      expect(
        negativeSignal,
        'negative-control: no highlight detected'
      ).toBeLessThanOrEqual(20);
      expect(
        actualSignal,
        'held multi-cell selection paints no highlight'
      ).toBeLessThanOrEqual(allowedSignal);
    } finally {
      await setSelectionPaintControl(page, null);
      await page.mouse.up();
    }

    await expect
      .poll(() =>
        cells.evaluateAll(
          (elements) =>
            elements.filter((element) =>
              element.hasAttribute('data-table-cell-selected')
            ).length
        )
      )
      .toBe(2);
    await expect
      .poll(() =>
        page.evaluate(() => ({
          nativeText: window.getSelection()?.toString() ?? '',
          rangeCount: window.getSelection()?.rangeCount ?? 0,
        }))
      )
      .toEqual({ nativeText: '', rangeCount: 0 });
    await expect
      .poll(() =>
        root.evaluate((element) => element.contains(document.activeElement))
      )
      .toBe(true);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(CONTRACT_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/table-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(page, CONTRACT_CASE_ID, root);
    const cells = root.locator(
      'table td[data-editor-node-key], table th[data-editor-node-key]'
    );
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    await expect(cells).toHaveCount(16);

    const start = await cells.nth(0).boundingBox();
    const end = await cells.nth(9).boundingBox();

    expect(start).not.toBeNull();
    expect(end).not.toBeNull();

    const startPoint = {
      x: start!.x + 30,
      y: start!.y + start!.height / 2,
    };
    const endPoint = {
      x: end!.x + 30,
      y: end!.y + end!.height / 2,
    };

    await page.mouse.move(startPoint.x, startPoint.y);
    await page.mouse.down();

    try {
      for (let step = 1; step <= 8; step++) {
        const progress = step / 8;

        await page.mouse.move(
          startPoint.x + (endPoint.x - startPoint.x) * progress,
          startPoint.y + (endPoint.y - startPoint.y) * progress
        );
        await page.waitForTimeout(40);
      }

      await expect
        .poll(() =>
          cells.evaluateAll(
            (elements) =>
              elements.filter((element) =>
                element.hasAttribute('data-table-cell-selected')
              ).length
          )
        )
        .toBe(6);

      await expect
        .poll(async () => {
          const selection = await editor.get.selection();

          return (
            !!selection &&
            selection.anchor.path.join(',') !== selection.focus.path.join(',')
          );
        })
        .toBe(true);

      for (let step = 1; step <= 8; step++) {
        const progress = step / 8;

        await page.mouse.move(
          endPoint.x + (startPoint.x - endPoint.x) * progress,
          endPoint.y + (startPoint.y - endPoint.y) * progress
        );
        await page.waitForTimeout(40);
      }

      await expect
        .poll(async () => {
          const selection = await editor.get.selection();
          const nativeText = await page.evaluate(
            () => window.getSelection()?.toString() ?? ''
          );

          return {
            modelSelectionInOneCell:
              !!selection &&
              selection.anchor.path.join(',') ===
                selection.focus.path.join(','),
            nativeSelectionInOrigin:
              nativeText.length === 0 || 'Plugin'.includes(nativeText),
            selectedCount: await cells.evaluateAll(
              (elements) =>
                elements.filter((element) =>
                  element.hasAttribute('data-table-cell-selected')
                ).length
            ),
          };
        })
        .toEqual({
          modelSelectionInOneCell: true,
          nativeSelectionInOrigin: true,
          selectedCount: 0,
        });
    } finally {
      await page.mouse.up();
    }

    await expect
      .poll(() =>
        cells.evaluateAll(
          (elements) =>
            elements.filter((element) =>
              element.hasAttribute('data-table-cell-selected')
            ).length
        )
      )
      .toBe(0);
    await expect
      .poll(() =>
        root.evaluate((element) => element.contains(document.activeElement))
      )
      .toBe(true);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(RESIZE_HANDLE_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/table-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(
      page,
      RESIZE_HANDLE_CASE_ID,
      root
    );
    const cells = root.locator(
      'table td[data-editor-node-key], table th[data-editor-node-key]'
    );
    await editor.ready({ editor: 'visible', text: 'Plugin' });
    await expect(cells).toHaveCount(16);

    const start = await cells.nth(0).boundingBox();
    const end = await cells.nth(4).boundingBox();
    const handle = cells
      .nth(4)
      .locator('[data-table-resize-handle="column-end"]');
    const handleBox = await handle.boundingBox();

    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    expect(handleBox).not.toBeNull();

    const startPoint = {
      x: start!.x + 30,
      y: start!.y + start!.height / 2,
    };
    const endPoint = {
      x: end!.x + 30,
      y: end!.y + end!.height / 2,
    };
    const handlePoint = {
      x: handleBox!.x + handleBox!.width / 2,
      y: handleBox!.y + handleBox!.height / 2,
    };

    const selectedCellCount = () =>
      cells.evaluateAll(
        (elements) =>
          elements.filter((element) =>
            element.hasAttribute('data-table-cell-selected')
          ).length
      );
    const hoverIndicatorDisplay = () =>
      handle.evaluate((element) => {
        const indicator = element.closest('table')?.previousElementSibling;

        return indicator ? getComputedStyle(indicator).display : null;
      });
    const handleCursor = () =>
      handle.evaluate((element) => getComputedStyle(element).cursor);
    const heldPointerTrace = () =>
      handle.getAttribute('data-test-held-pointer-trace');

    await handle.evaluate((element) => {
      element.addEventListener(
        'pointermove',
        (event) => {
          const pointerEvent = event as PointerEvent;

          element.setAttribute(
            'data-test-held-pointer-trace',
            `phase:target-capture;target:${pointerEvent.target === element ? 'resize-handle' : 'other'};event:${pointerEvent.type};buttons:${pointerEvent.buttons};cursor:${getComputedStyle(element).cursor}`
          );
        },
        { capture: true }
      );
    });

    await expect.poll(selectedCellCount).toBe(0);
    await expect.poll(hoverIndicatorDisplay).toBe('none');
    await expect.poll(handleCursor).toBe('col-resize');

    await page.mouse.move(startPoint.x, startPoint.y);
    await page.mouse.down();

    try {
      await page.mouse.move(endPoint.x, endPoint.y, { steps: 8 });
      await expect.poll(selectedCellCount).toBe(2);
      // Event-handler cursor repair is already too late for a no-flash claim.
      expect(await handleCursor()).toBe('text');

      const heldSelection = await editor.get.selection();

      expect(heldSelection).not.toBeNull();
      await page.mouse.move(handlePoint.x, handlePoint.y);
      await expect
        .poll(heldPointerTrace)
        .toBe(
          'phase:target-capture;target:resize-handle;event:pointermove;buttons:1;cursor:text'
        );
      await expect
        .poll(() =>
          handle.evaluate(
            (element, point) =>
              document.elementFromPoint(point.x, point.y) === element,
            handlePoint
          )
        )
        .toBe(true);
      await expect.poll(() => editor.get.selection()).toEqual(heldSelection);
      await expect.poll(selectedCellCount).toBe(2);
      await expect.poll(hoverIndicatorDisplay).toBe('none');
      await expect.poll(handleCursor).toBe('text');
      await expect
        .poll(() => root.locator('tr[data-table-resizing="true"]').count())
        .toBe(0);

      const followUp = await cells.nth(8).boundingBox();

      expect(followUp).not.toBeNull();
      await page.mouse.move(
        followUp!.x + 30,
        followUp!.y + followUp!.height / 2,
        { steps: 8 }
      );
      await expect.poll(selectedCellCount).toBe(3);
    } finally {
      await page.mouse.up();
    }

    await expect.poll(selectedCellCount).toBe(3);
    await page.mouse.move(handlePoint.x, handlePoint.y);
    await expect.poll(hoverIndicatorDisplay).toBe('block');
    await expect.poll(handleCursor).toBe('col-resize');
    await page.mouse.move(endPoint.x, endPoint.y);
    await expect.poll(hoverIndicatorDisplay).toBe('none');
    await expect
      .poll(() =>
        root.evaluate((element) => element.contains(document.activeElement))
      )
      .toBe(true);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
