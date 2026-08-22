import { expect, type Locator, type Page, test } from '@playwright/test';

const TABLE_HTML = `
  <table>
    <tbody>
      <tr>
        <td colspan="2" rowspan="2"><p>Imported span</p></td>
        <td><p>Right</p></td>
      </tr>
      <tr>
        <td><p>Bottom</p></td>
      </tr>
    </tbody>
  </table>
`;

const recordRuntimeErrors = (page: Page) => {
  const errors: string[] = [];
  const onConsole = (message: { text: () => string; type: () => string }) => {
    if (message.type() === 'error') errors.push(message.text());
  };
  const onPageError = (error: Error) => {
    errors.push(error.stack ?? error.message);
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    assertNone: () => expect(errors).toEqual([]),
    stop: () => {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
};

const recordTableDiagnostics = (page: Page) => {
  const messages: string[] = [];
  const onConsole = (message: { text: () => string; type: () => string }) => {
    const text = message.text();

    if (
      ['info', 'log', 'warning'].includes(message.type()) &&
      (text.includes('TABLE_') || text.includes('Table paste'))
    ) {
      messages.push(text);
    }
  };

  page.on('console', onConsole);

  return {
    read: () => [...messages],
    stop: () => page.off('console', onConsole),
  };
};

const readClipboard = (page: Page) =>
  page.evaluate(async () => {
    const values: Record<string, string> = {};

    for (const item of await navigator.clipboard.read()) {
      for (const type of item.types) {
        const blob = await item.getType(type);

        values[type] = await blob.text();
      }
    }

    return values;
  });

const writeClipboard = (page: Page, values: Record<string, string>) =>
  page.evaluate(async (nextValues) => {
    await navigator.clipboard.write([
      new ClipboardItem(
        Object.fromEntries(
          Object.entries(nextValues).map(([type, value]) => [
            type,
            new Blob([value], { type }),
          ])
        )
      ),
    ]);
  }, values);

const copySelectionAndReadFormats = async (page: Page) => {
  await page.evaluate(() => {
    const state = window as typeof window & {
      __tableCopyFormats?: Record<string, string> | null;
    };

    state.__tableCopyFormats = null;
    document.addEventListener(
      'copy',
      (event) => {
        const clipboard = event.clipboardData;
        const values: Record<string, string> = {};

        for (const type of clipboard?.types ?? []) {
          values[type] = clipboard?.getData(type) ?? '';
        }

        state.__tableCopyFormats = values;
      },
      { once: true }
    );
  });
  await page.keyboard.press('ControlOrMeta+C');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as typeof window & {
              __tableCopyFormats?: Record<string, string> | null;
            }
          ).__tableCopyFormats
      )
    )
    .not.toBeNull();

  return page.evaluate(
    () =>
      (
        window as typeof window & {
          __tableCopyFormats?: Record<string, string> | null;
        }
      ).__tableCopyFormats ?? {}
  );
};

const pasteClipboardAndReadFormats = async (page: Page) => {
  await page.evaluate(() => {
    const state = window as typeof window & {
      __tablePasteInput?: {
        beforeInputTypes: string[];
        formats: Record<string, string> | null;
      };
    };

    state.__tablePasteInput = {
      beforeInputTypes: [],
      formats: null,
    };
    document.addEventListener(
      'paste',
      (event) => {
        const clipboard = event.clipboardData;
        const values: Record<string, string> = {};

        for (const type of clipboard?.types ?? []) {
          values[type] = clipboard?.getData(type) ?? '';
        }

        if (state.__tablePasteInput) {
          state.__tablePasteInput.formats = values;
        }
      },
      { once: true }
    );
    document.addEventListener(
      'beforeinput',
      (event) => {
        state.__tablePasteInput?.beforeInputTypes.push(event.inputType);
      },
      { once: true }
    );
  });
  await page.keyboard.press('ControlOrMeta+V');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as typeof window & {
              __tablePasteInput?: {
                beforeInputTypes: string[];
                formats: Record<string, string> | null;
              };
            }
          ).__tablePasteInput
      )
    )
    .toMatchObject({
      formats: expect.any(Object),
    });

  return page.evaluate(
    () =>
      (
        window as typeof window & {
          __tablePasteInput?: {
            beforeInputTypes: string[];
            formats: Record<string, string> | null;
          };
        }
      ).__tablePasteInput ?? {
        beforeInputTypes: [],
        formats: {},
      }
  );
};

const getEditor = (page: Page) =>
  page.locator('[data-plite-editor="true"][contenteditable="true"]');

const getOriginalTable = (page: Page) => {
  const editor = getEditor(page);

  return editor.locator('table').filter({
    has: page.locator('[data-table-cell-id="table-demo-header-plugin"]'),
  });
};

const getTableCell = (table: Locator, id: string) =>
  table.locator(`:is(td, th)[data-table-cell-id="${id}"]`);

const getCellDragHandle = (table: Locator, id: string) =>
  table.locator(
    `[data-table-cell-drag-handle="true"][data-table-cell-drag-for="${id}"]`
  );

const dragAndReadNativeEvents = async (
  page: Page,
  source: Locator,
  target: Locator
) => {
  await page.evaluate(() => {
    (
      window as typeof window & {
        __tableDragEvents?: string[];
      }
    ).__tableDragEvents = [];

    for (const type of ['dragstart', 'dragover', 'drop', 'dragend']) {
      document.addEventListener(
        type,
        () => {
          const state = window as typeof window & {
            __tableDragEvents?: string[];
          };

          if (state.__tableDragEvents?.at(-1) !== type) {
            state.__tableDragEvents?.push(type);
          }
        },
        { capture: true }
      );
    }
  });
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error('Expected visible native drag source and target');
  }

  const sourcePoint = {
    x: sourceBox.x + sourceBox.width / 2,
    y: sourceBox.y + sourceBox.height / 2,
  };
  const targetPoint = {
    x: targetBox.x + targetBox.width / 2,
    y: targetBox.y + targetBox.height / 2,
  };
  const sourceHitIsHandle = await page.evaluate(
    ({ x, y }) =>
      document
        .elementFromPoint(x, y)
        ?.closest('[data-table-cell-drag-handle="true"]') !== null,
    sourcePoint
  );

  if (!sourceHitIsHandle) {
    throw new Error('Table cell drag handle is not pointer-accessible');
  }

  await source.dragTo(target, {
    sourcePosition: {
      x: sourcePoint.x - sourceBox.x,
      y: sourcePoint.y - sourceBox.y,
    },
    targetPosition: {
      x: targetPoint.x - targetBox.x,
      y: targetPoint.y - targetBox.y,
    },
  });

  return page.evaluate(
    () =>
      (
        window as typeof window & {
          __tableDragEvents?: string[];
        }
      ).__tableDragEvents ?? []
  );
};

const expectEditorFocus = async (editor: Locator) => {
  await expect
    .poll(() =>
      editor.evaluate((element) => element.contains(document.activeElement))
    )
    .toBe(true);
};

const placeCaretInCell = async (cell: Locator, editor: Locator) => {
  const content = cell.locator('[data-plite-node="element"]').first();

  await expect(content).toHaveCount(1);
  await content.click();
  await expect
    .poll(() =>
      cell.evaluate((element) => {
        const anchorNode = document.getSelection()?.anchorNode;

        return !!anchorNode && element.contains(anchorNode);
      })
    )
    .toBe(true);
  await expectEditorFocus(editor);
};

const selectCellRectangle = async (
  page: Page,
  table: Locator,
  editor: Locator,
  {
    expectedCount,
    moves,
    startId,
  }: {
    expectedCount: number;
    moves: ReadonlyArray<'ArrowDown' | 'ArrowRight'>;
    startId: string;
  }
) => {
  await page.keyboard.press('Escape');
  await placeCaretInCell(getTableCell(table, startId), editor);
  await page.keyboard.press('End');

  for (const move of moves) {
    await page.keyboard.press(`Shift+${move}`);
  }

  await expect(
    table.locator(':is(td, th)[data-table-cell-selected="true"]')
  ).toHaveCount(expectedCount);
};

const expectCellTexts = async (
  table: Locator,
  expected: Readonly<Record<string, string>>
) => {
  for (const [id, text] of Object.entries(expected)) {
    await expect(
      getTableCell(table, id).locator('[data-plite-node="element"]').first()
    ).toHaveText(text);
  }
};

const readTableSnapshot = (table: Locator) =>
  table.evaluate((element) => ({
    cells: Array.from(element.querySelectorAll('[data-table-cell-id]')).map(
      (cell) => ({
        colSpan: cell.getAttribute('colspan'),
        id: cell.getAttribute('data-table-cell-id'),
        rowSpan: cell.getAttribute('rowspan'),
        text: cell.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      })
    ),
    rows: element.querySelectorAll('tr').length,
  }));

const rewriteEmbeddedFragmentHtml = (
  page: Page,
  html: string,
  mode: 'corrupt-model' | 'empty-model' | 'visible-conflict'
) =>
  page.evaluate(
    ({ html: innerHtml, mode: innerMode }) => {
      const document = new DOMParser().parseFromString(innerHtml, 'text/html');
      const carrier = document.body.querySelector('[data-plite-fragment]');
      const encoded = carrier?.getAttribute('data-plite-fragment');

      if (!carrier || !encoded) {
        throw new Error(
          'Expected copied HTML to carry an exact Plite fragment'
        );
      }

      if (innerMode === 'corrupt-model') {
        carrier.setAttribute('data-plite-fragment', 'not-valid-base64');
      } else if (innerMode === 'empty-model') {
        const payload = JSON.parse(decodeURIComponent(atob(encoded))) as {
          slice?: {
            content?: Array<{ children?: unknown[] }>;
            openEnd?: number;
            openStart?: number;
          };
        };
        const table = payload.slice?.content?.[0];

        if (!payload.slice || !table || !Array.isArray(table.children)) {
          throw new Error('Expected copied exact fragment to contain a table');
        }

        table.children = [];
        payload.slice.openEnd = 0;
        payload.slice.openStart = 0;
        carrier.setAttribute(
          'data-plite-fragment',
          btoa(encodeURIComponent(JSON.stringify(payload)))
        );
      }

      const walker = document.createTreeWalker(carrier, NodeFilter.SHOW_TEXT);
      let index = 0;
      let textNode = walker.nextNode();

      while (textNode) {
        if (textNode.textContent?.trim()) {
          textNode.textContent = `HTML conflict ${(index += 1)}`;
        }

        textNode = walker.nextNode();
      }

      return document.body.innerHTML;
    },
    { html, mode }
  );

const runTableMenuCommand = async (
  page: Page,
  group: 'Cell' | 'Column' | 'Row',
  command: string
) => {
  const trigger = page.getByRole('button', {
    exact: true,
    name: 'Table',
  });

  await expect(trigger).toHaveCount(1);
  const triggerId = await trigger.getAttribute('id');

  if (!triggerId) {
    throw new Error('Expected the table menu trigger to have an id');
  }

  const rootMenu = page.locator(
    `[data-slot="dropdown-menu-content"][aria-labelledby="${triggerId}"]`
  );

  await trigger.click();

  const groupItem = page.getByRole('menuitem', {
    exact: true,
    name: group,
  });

  await expect(groupItem).toHaveCount(1);
  await groupItem.hover();

  const commandItem = page.getByRole('menuitem', {
    exact: true,
    name: command,
  });

  await expect(commandItem).toHaveCount(1);
  await expect(commandItem).toBeEnabled();
  await commandItem.click();
  await expect(rootMenu).toHaveCount(0);
};

test.describe('table registry demo', () => {
  test('renders, selects, and resizes cells without runtime errors', async ({
    page,
  }) => {
    const runtimeErrors = recordRuntimeErrors(page);
    const editor = getEditor(page);
    const table = getOriginalTable(page);

    try {
      await page.goto('/blocks/table-demo');
      await expect(editor).toHaveCount(1);
      await expect(editor).toBeVisible();
      await expect(table).toHaveCount(1);
      await expect(table).toBeVisible();
      await expect(table.locator('[data-table-cell-id]')).toHaveCount(16);

      const lastCell = table.locator(
        '[data-table-cell-id="table-demo-header-void"]'
      );
      const columns = table.locator('col');

      await expect(lastCell).toHaveCount(1);
      await expect(columns).toHaveCount(5);

      const lastDataColumn = table.locator('col').nth(4);
      const widthBefore = await lastDataColumn.evaluate((element) =>
        Number.parseFloat((element as HTMLElement).style.width)
      );
      const resizeHandle = lastCell.locator(
        '[data-table-resize-handle="column-end"]'
      );

      await expect(resizeHandle).toHaveCount(1);
      await resizeHandle.hover();
      const handleBox = await resizeHandle.boundingBox();

      if (!handleBox) {
        throw new Error('Expected a visible column resize handle');
      }

      await page.mouse.down();
      await page.mouse.move(
        handleBox.x + handleBox.width / 2 + 40,
        handleBox.y + handleBox.height / 2,
        { steps: 5 }
      );
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          })
      );

      await expect
        .poll(() =>
          lastDataColumn.evaluate((element) =>
            Number.parseFloat((element as HTMLElement).style.width)
          )
        )
        .toBeGreaterThan(widthBefore + 20);

      await page.mouse.up();

      await expect
        .poll(() =>
          lastDataColumn.evaluate((element) =>
            Number.parseFloat((element as HTMLElement).style.width)
          )
        )
        .toBeGreaterThan(widthBefore + 20);

      await lastCell.click();
      await page.keyboard.press('ControlOrMeta+A');
      await expect(
        table.locator(':is(td, th)[data-table-cell-selected="true"]')
      ).toHaveCount(16);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('owns repeated plain vertical navigation before browser paint', async ({
    page,
  }) => {
    const runtimeErrors = recordRuntimeErrors(page);
    const editor = getEditor(page);
    const table = getOriginalTable(page);

    try {
      await page.goto('/blocks/table-demo');
      await expect(editor).toHaveCount(1);
      await expect(table).toHaveCount(1);
      await page.evaluate(() => {
        const state = window as typeof window & {
          __tableVerticalFrames?: Array<{
            cellId: string | null;
            defaultPrevented: boolean;
            key: string;
          }>;
        };

        state.__tableVerticalFrames = [];
        document.addEventListener(
          'keydown',
          (event) => {
            if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;

            requestAnimationFrame(() => {
              const anchorNode = document.getSelection()?.anchorNode;
              const anchorElement =
                anchorNode instanceof Element
                  ? anchorNode
                  : anchorNode?.parentElement;

              state.__tableVerticalFrames?.push({
                cellId:
                  anchorElement
                    ?.closest('[data-table-cell-id]')
                    ?.getAttribute('data-table-cell-id') ?? null,
                defaultPrevented: event.defaultPrevented,
                key: event.key,
              });
            });
          },
          { capture: true }
        );
      });

      await placeCaretInCell(
        getTableCell(table, 'table-demo-heading-name'),
        editor
      );
      await page.keyboard.press('End');

      for (const key of ['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp']) {
        await page.keyboard.press(key);
        await page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              requestAnimationFrame(() => resolve());
            })
        );
      }

      await expect
        .poll(() =>
          page.evaluate(
            () =>
              (
                window as typeof window & {
                  __tableVerticalFrames?: Array<{
                    cellId: string | null;
                    defaultPrevented: boolean;
                    key: string;
                  }>;
                }
              ).__tableVerticalFrames ?? []
          )
        )
        .toEqual([
          {
            cellId: 'table-demo-image-name',
            defaultPrevented: true,
            key: 'ArrowDown',
          },
          {
            cellId: 'table-demo-mention-name',
            defaultPrevented: true,
            key: 'ArrowDown',
          },
          {
            cellId: 'table-demo-image-name',
            defaultPrevented: true,
            key: 'ArrowUp',
          },
          {
            cellId: 'table-demo-heading-name',
            defaultPrevented: true,
            key: 'ArrowUp',
          },
        ]);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('creates a sized body table from the keyboard picker', async ({
    page,
  }) => {
    const runtimeErrors = recordRuntimeErrors(page);
    const editor = getEditor(page);
    const tables = editor.locator('table');
    const insertionPoint = editor.getByText(
      'Create customizable tables with resizable columns and rows, allowing you to design structured layouts.'
    );

    try {
      await page.goto('/blocks/table-demo');
      await expect(editor).toHaveCount(1);
      await expect(tables).toHaveCount(1);

      await insertionPoint.click();
      await page.keyboard.press('End');

      const tableTrigger = page.getByRole('button', {
        exact: true,
        name: 'Table',
      });

      await expect(tableTrigger).toHaveCount(1);
      await tableTrigger.click();

      const tableMenuItem = page.getByRole('menuitem', {
        exact: true,
        name: 'Table',
      });

      await expect(tableMenuItem).toHaveCount(1);
      await tableMenuItem.hover();

      const firstPickerCell = page.getByRole('gridcell', {
        exact: true,
        name: 'Insert 1 by 1 table',
      });

      await expect(firstPickerCell).toHaveCount(1);
      await expect(firstPickerCell).toBeFocused();
      await firstPickerCell.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');

      const targetPickerCell = page.getByRole('gridcell', {
        exact: true,
        name: 'Insert 2 by 3 table',
      });

      await expect(targetPickerCell).toBeFocused();
      await targetPickerCell.press('Enter');

      await expect(tables).toHaveCount(2);

      const createdTable = tables.filter({
        hasNot: page.locator('[data-table-cell-id="table-demo-header-plugin"]'),
      });

      await expect(createdTable).toHaveCount(1);
      await expect(createdTable.locator('tr')).toHaveCount(2);
      await expect(createdTable.locator('[data-table-cell-id]')).toHaveCount(6);
      await expect(createdTable.locator('th[data-table-cell-id]')).toHaveCount(
        0
      );
      await expect(createdTable.locator('td[data-table-cell-id]')).toHaveCount(
        6
      );
      await expect
        .poll(() =>
          createdTable.evaluate((table) => {
            const anchorNode = document.getSelection()?.anchorNode;

            return !!anchorNode && table.contains(anchorNode);
          })
        )
        .toBe(true);
      await expectEditorFocus(editor);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('preserves header, selection, and sizing through table commands', async ({
    page,
  }) => {
    const runtimeErrors = recordRuntimeErrors(page);
    const editor = getEditor(page);
    const table = getOriginalTable(page);
    let pointerIsDown = false;

    try {
      await page.goto('/blocks/table-demo');
      await expect(editor).toHaveCount(1);
      await expect(table).toHaveCount(1);
      await expect(table.locator('tr')).toHaveCount(4);
      await expect(table.locator('[data-table-cell-id]')).toHaveCount(16);
      await expect(table.locator('th[data-table-cell-id]')).toHaveCount(4);
      await expect(table.locator('td[data-table-cell-id]')).toHaveCount(12);

      const headerRow = table.locator('tr').filter({
        has: page.locator('[data-table-cell-id="table-demo-header-plugin"]'),
      });

      await placeCaretInCell(
        table.locator('[data-table-cell-id="table-demo-header-void"]'),
        editor
      );
      await runTableMenuCommand(page, 'Column', 'Insert column after');
      await expect(headerRow.locator('[data-table-cell-id]')).toHaveCount(5);
      await expect(table.locator('th[data-table-cell-id]')).toHaveCount(5);
      await expect(table.locator('td[data-table-cell-id]')).toHaveCount(15);
      await expectEditorFocus(editor);

      const insertedHeaderCell = headerRow
        .locator('[data-table-cell-id]')
        .nth(4);

      await placeCaretInCell(insertedHeaderCell, editor);
      await runTableMenuCommand(page, 'Column', 'Delete column');
      await expect(headerRow.locator('[data-table-cell-id]')).toHaveCount(4);
      await expect(table.locator('th[data-table-cell-id]')).toHaveCount(4);
      await expect(table.locator('td[data-table-cell-id]')).toHaveCount(12);
      await expectEditorFocus(editor);

      await placeCaretInCell(
        table.locator('[data-table-cell-id="table-demo-image-element"]'),
        editor
      );
      await runTableMenuCommand(page, 'Row', 'Insert row after');
      await expect(table.locator('tr')).toHaveCount(5);
      await expect(table.locator('th[data-table-cell-id]')).toHaveCount(4);
      await expect(table.locator('td[data-table-cell-id]')).toHaveCount(16);

      const insertedBodyRow = table.locator('tr').nth(3);

      await expect(
        insertedBodyRow.locator('th[data-table-cell-id]')
      ).toHaveCount(0);
      await expect(
        insertedBodyRow.locator('td[data-table-cell-id]')
      ).toHaveCount(4);
      await placeCaretInCell(
        insertedBodyRow.locator('[data-table-cell-id]').nth(0),
        editor
      );
      await runTableMenuCommand(page, 'Row', 'Delete row');
      await expect(table.locator('tr')).toHaveCount(4);
      await expect(table.locator('th[data-table-cell-id]')).toHaveCount(4);
      await expect(table.locator('td[data-table-cell-id]')).toHaveCount(12);
      await expectEditorFocus(editor);

      const mergeAnchor = table.locator(
        '[data-table-cell-id="table-demo-heading-element"]'
      );
      const selectedCells = table.locator(
        ':is(td, th)[data-table-cell-selected="true"]'
      );

      await page.keyboard.press('Escape');
      await expect(selectedCells).toHaveCount(0);
      await placeCaretInCell(mergeAnchor, editor);
      await page.keyboard.press('Shift+ArrowRight');

      expect(
        await selectedCells.evaluateAll((cells) =>
          cells.map((cell) => cell.getAttribute('data-table-cell-id'))
        )
      ).toEqual(['table-demo-heading-element', 'table-demo-heading-inline']);
      await expect(selectedCells).toHaveCount(2);

      await runTableMenuCommand(page, 'Cell', 'Merge cells');
      await expect(table.locator('[data-table-cell-id]')).toHaveCount(15);
      await expect(table.locator('th[data-table-cell-id]')).toHaveCount(4);
      await expect(table.locator('td[data-table-cell-id]')).toHaveCount(11);
      await expect(mergeAnchor).toHaveAttribute('colspan', '2');
      await expect(mergeAnchor).toHaveJSProperty('tagName', 'TD');
      await expectEditorFocus(editor);

      await placeCaretInCell(mergeAnchor, editor);
      await runTableMenuCommand(page, 'Cell', 'Split cell');
      await expect(table.locator('[data-table-cell-id]')).toHaveCount(16);
      await expect(table.locator('th[data-table-cell-id]')).toHaveCount(4);
      await expect(table.locator('td[data-table-cell-id]')).toHaveCount(12);
      await expect(mergeAnchor).toHaveAttribute('colspan', '1');
      await expect(mergeAnchor).toHaveJSProperty('tagName', 'TD');
      await expectEditorFocus(editor);

      await page.keyboard.press('Escape');
      await expect(selectedCells).toHaveCount(0);
      await placeCaretInCell(mergeAnchor, editor);
      await page.keyboard.press('Shift+ArrowRight');
      await expect(selectedCells).toHaveCount(2);

      const selectedIdsBefore = await selectedCells.evaluateAll((cells) =>
        cells.map((cell) => cell.getAttribute('data-table-cell-id'))
      );
      const columns = table.locator('col');

      await expect(columns).toHaveCount(5);

      const lastDataColumn = columns.nth(4);
      const widthBefore = await lastDataColumn.evaluate((element) =>
        Number.parseFloat((element as HTMLElement).style.width)
      );
      const resizeHandle = table
        .locator('[data-table-cell-id="table-demo-header-void"]')
        .locator('[data-table-resize-handle="column-end"]');

      await expect(resizeHandle).toHaveCount(1);
      await resizeHandle.hover();

      const handleBox = await resizeHandle.boundingBox();

      if (!handleBox) {
        throw new Error('Expected a visible column resize handle');
      }

      await page.mouse.down();
      pointerIsDown = true;
      await page.mouse.move(
        handleBox.x + handleBox.width / 2 + 40,
        handleBox.y + handleBox.height / 2,
        { steps: 5 }
      );

      await expect
        .poll(() =>
          lastDataColumn.evaluate((element) =>
            Number.parseFloat((element as HTMLElement).style.width)
          )
        )
        .toBeGreaterThan(widthBefore + 20);
      await expect
        .poll(() =>
          selectedCells.evaluateAll((cells) =>
            cells.map((cell) => cell.getAttribute('data-table-cell-id'))
          )
        )
        .toEqual(selectedIdsBefore);

      await page.mouse.up();
      pointerIsDown = false;

      await expect
        .poll(() =>
          lastDataColumn.evaluate((element) =>
            Number.parseFloat((element as HTMLElement).style.width)
          )
        )
        .toBeGreaterThan(widthBefore + 20);
      await expect
        .poll(() =>
          selectedCells.evaluateAll((cells) =>
            cells.map((cell) => cell.getAttribute('data-table-cell-id'))
          )
        )
        .toEqual(selectedIdsBefore);
      await expectEditorFocus(editor);
      runtimeErrors.assertNone();
    } finally {
      if (pointerIsDown) await page.mouse.up();
      runtimeErrors.stop();
    }
  });

  test.describe('native Chromium table-cell drag', () => {
    test('moves a self-overlapping selection without erasing its destination', async ({
      browserName,
      page,
    }) => {
      test.skip(browserName !== 'chromium', 'Native Chromium drag/drop proof');

      const runtimeErrors = recordRuntimeErrors(page);
      const editor = getEditor(page);
      const table = getOriginalTable(page);

      try {
        await page.goto('/blocks/table-demo');
        await expect(editor).toHaveCount(1);
        await expect(table).toHaveCount(1);
        await selectCellRectangle(page, table, editor, {
          expectedCount: 4,
          moves: ['ArrowRight', 'ArrowDown'],
          startId: 'table-demo-heading-name',
        });

        const dragHandle = getCellDragHandle(table, 'table-demo-heading-name');

        await expect(dragHandle).toBeVisible();
        const dragEvents = await dragAndReadNativeEvents(
          page,
          dragHandle,
          getTableCell(table, 'table-demo-heading-element')
        );

        runtimeErrors.assertNone();
        expect(dragEvents.slice(0, 3)).toEqual([
          'dragstart',
          'dragover',
          'drop',
        ]);

        await expectCellTexts(table, {
          'table-demo-heading-element': 'Heading',
          'table-demo-heading-inline': '',
          'table-demo-heading-name': '',
          'table-demo-image-element': 'Image',
          'table-demo-image-inline': 'Yes',
          'table-demo-image-name': '',
        });
      } finally {
        runtimeErrors.stop();
      }
    });

    test('moves selected cells across tables', async ({
      browserName,
      page,
    }) => {
      test.skip(browserName !== 'chromium', 'Native Chromium drag/drop proof');

      const runtimeErrors = recordRuntimeErrors(page);
      const editor = getEditor(page);
      const sourceTable = getOriginalTable(page);
      const insertionPoint = editor.getByText(
        'Create customizable tables with resizable columns and rows, allowing you to design structured layouts.'
      );

      try {
        await page.goto('/blocks/table-demo');
        await expect(editor).toHaveCount(1);
        await expect(sourceTable).toHaveCount(1);
        await insertionPoint.click();
        await page.keyboard.press('End');

        const tableTrigger = page.getByRole('button', {
          exact: true,
          name: 'Table',
        });

        await tableTrigger.click();
        await page
          .getByRole('menuitem', { exact: true, name: 'Table' })
          .hover();
        await page
          .getByRole('gridcell', {
            exact: true,
            name: 'Insert 2 by 2 table',
          })
          .click();

        const targetTable = editor.locator('table').filter({
          hasNot: page.locator(
            '[data-table-cell-id="table-demo-header-plugin"]'
          ),
        });

        await expect(targetTable).toHaveCount(1);
        await expect(
          targetTable.locator(':is(td, th)[data-table-cell-id]')
        ).toHaveCount(4);

        const targetIds = await targetTable
          .locator(':is(td, th)[data-table-cell-id]')
          .evaluateAll((cells) =>
            cells
              .slice(0, 2)
              .map((cell) => cell.getAttribute('data-table-cell-id'))
          );
        const [firstTargetId, secondTargetId] = targetIds;

        if (!firstTargetId || !secondTargetId) {
          throw new Error('Expected stable IDs on the created table cells');
        }

        await selectCellRectangle(page, sourceTable, editor, {
          expectedCount: 2,
          moves: ['ArrowRight'],
          startId: 'table-demo-image-name',
        });

        const dragHandle = getCellDragHandle(
          sourceTable,
          'table-demo-image-name'
        );

        await expect(dragHandle).toBeVisible();
        const dragEvents = await dragAndReadNativeEvents(
          page,
          dragHandle,
          getTableCell(targetTable, firstTargetId)
        );

        expect(dragEvents.slice(0, 3)).toEqual([
          'dragstart',
          'dragover',
          'drop',
        ]);
        runtimeErrors.assertNone();

        await expectCellTexts(sourceTable, {
          'table-demo-image-element': '',
          'table-demo-image-name': '',
        });
        await expectCellTexts(targetTable, {
          [firstTargetId]: 'Image',
          [secondTargetId]: 'Yes',
        });
      } finally {
        runtimeErrors.stop();
      }
    });
  });

  test.describe('native Chromium clipboard', () => {
    test.describe.configure({ mode: 'serial' });

    test('pastes CSV plain text into selected table cells', async ({
      browserName,
      context,
      page,
    }) => {
      test.skip(browserName !== 'chromium', 'Native Chromium clipboard proof');

      await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
        origin: 'http://localhost:3000',
      });

      const runtimeErrors = recordRuntimeErrors(page);
      const tableDiagnostics = recordTableDiagnostics(page);
      const editor = getEditor(page);
      const table = getOriginalTable(page);

      try {
        await page.goto('/blocks/table-demo');
        await expect(editor).toHaveCount(1);
        await expect(table).toHaveCount(1);
        await selectCellRectangle(page, table, editor, {
          expectedCount: 4,
          moves: ['ArrowRight', 'ArrowDown'],
          startId: 'table-demo-heading-name',
        });

        await writeClipboard(page, {
          'text/plain': 'Alpha,Beta\nOne,Two',
        });
        expect(
          await editor.evaluate((element) =>
            element.contains(document.activeElement)
          )
        ).toBe(true);
        await expect(
          table.locator(':is(td, th)[data-table-cell-selected="true"]')
        ).toHaveCount(4);
        const pasted = await pasteClipboardAndReadFormats(page);

        expect(pasted.formats?.['text/plain']).toBe('Alpha,Beta\nOne,Two');
        runtimeErrors.assertNone();
        expect(tableDiagnostics.read()).toEqual([]);

        await expectCellTexts(table, {
          'table-demo-heading-element': 'Beta',
          'table-demo-heading-name': 'Alpha',
          'table-demo-image-element': 'Two',
          'table-demo-image-name': 'One',
        });
      } finally {
        tableDiagnostics.stop();
        runtimeErrors.stop();
      }
    });

    test('exports table selections as exact CSV, TSV, and plain text', async ({
      browserName,
      context,
      page,
    }) => {
      test.skip(browserName !== 'chromium', 'Native Chromium clipboard proof');

      await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
        origin: 'http://localhost:3000',
      });

      const runtimeErrors = recordRuntimeErrors(page);
      const editor = getEditor(page);
      const table = getOriginalTable(page);

      try {
        await page.goto('/blocks/table-demo');
        await expect(editor).toHaveCount(1);
        await expect(table).toHaveCount(1);
        await selectCellRectangle(page, table, editor, {
          expectedCount: 4,
          moves: ['ArrowRight', 'ArrowDown'],
          startId: 'table-demo-heading-name',
        });

        const copied = await copySelectionAndReadFormats(page);

        expect(copied['text/csv']).toBe('Heading,\nImage,Yes\n');
        expect(copied['text/tsv']).toBe('Heading\t\nImage\tYes\n');
        expect(copied['text/plain']).toBe('Heading\t\nImage\tYes\n');
        expect(copied['text/html']).toContain('<table');
        expect(copied['application/x-plite-fragment']).toBeTruthy();
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });

    test('prefers copied exact model over conflicting HTML and plain text', async ({
      browserName,
      context,
      page,
    }) => {
      test.skip(browserName !== 'chromium', 'Native Chromium clipboard proof');

      await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
        origin: 'http://localhost:3000',
      });

      const runtimeErrors = recordRuntimeErrors(page);
      const editor = getEditor(page);
      const table = getOriginalTable(page);

      try {
        await page.goto('/blocks/table-demo');
        await expect(editor).toHaveCount(1);
        await expect(table).toHaveCount(1);
        await selectCellRectangle(page, table, editor, {
          expectedCount: 2,
          moves: ['ArrowRight'],
          startId: 'table-demo-image-name',
        });
        const exported = await copySelectionAndReadFormats(page);

        const copied = await readClipboard(page);

        expect(exported['application/x-plite-fragment']).toBeTruthy();
        expect(copied['text/html']).toContain('data-plite-fragment=');

        const conflictingHtml = await rewriteEmbeddedFragmentHtml(
          page,
          copied['text/html'],
          'visible-conflict'
        );

        await writeClipboard(page, {
          'text/html': conflictingHtml,
          'text/plain': 'Plain conflict 1\tPlain conflict 2',
        });
        await selectCellRectangle(page, table, editor, {
          expectedCount: 2,
          moves: ['ArrowRight'],
          startId: 'table-demo-mention-name',
        });
        await page.keyboard.press('ControlOrMeta+V');

        await expectCellTexts(table, {
          'table-demo-mention-element': 'Yes',
          'table-demo-mention-name': 'Image',
        });
        await expect(editor).not.toContainText('HTML conflict');
        await expect(editor).not.toContainText('Plain conflict');
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });

    test('rejects corrupt embedded exact metadata without fallback mutation', async ({
      browserName,
      context,
      page,
    }) => {
      test.skip(browserName !== 'chromium', 'Native Chromium clipboard proof');

      await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
        origin: 'http://localhost:3000',
      });

      const runtimeErrors = recordRuntimeErrors(page);
      const editor = getEditor(page);
      const table = getOriginalTable(page);

      try {
        await page.goto('/blocks/table-demo');
        await expect(editor).toHaveCount(1);
        await expect(table).toHaveCount(1);
        await selectCellRectangle(page, table, editor, {
          expectedCount: 2,
          moves: ['ArrowRight'],
          startId: 'table-demo-image-name',
        });
        await copySelectionAndReadFormats(page);

        const copied = await readClipboard(page);
        const malformedHtml = await rewriteEmbeddedFragmentHtml(
          page,
          copied['text/html'],
          'corrupt-model'
        );

        await writeClipboard(page, {
          'text/html': malformedHtml,
          'text/plain': 'Plain fallback 1\tPlain fallback 2',
        });
        await selectCellRectangle(page, table, editor, {
          expectedCount: 2,
          moves: ['ArrowRight'],
          startId: 'table-demo-mention-name',
        });

        const before = await readTableSnapshot(table);

        await page.keyboard.press('ControlOrMeta+V');

        await expect.poll(() => readTableSnapshot(table)).toEqual(before);
        await expect(editor).not.toContainText('HTML conflict');
        await expect(editor).not.toContainText('Plain fallback');
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });

    test('prefers HTML over conflicting plain text with canonical spans', async ({
      browserName,
      context,
      page,
    }) => {
      test.skip(browserName !== 'chromium', 'Native Chromium clipboard proof');

      await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
        origin: 'http://localhost:3000',
      });

      const runtimeErrors = recordRuntimeErrors(page);
      const editor = getEditor(page);
      const insertionPoint = editor.getByText(
        'Create customizable tables with resizable columns and rows, allowing you to design structured layouts.'
      );

      try {
        await page.goto('/blocks/table-demo');
        await expect(editor).toHaveCount(1);
        await insertionPoint.click();
        await page.keyboard.press('End');

        await writeClipboard(page, {
          'text/html': TABLE_HTML,
          'text/plain': 'Plain conflict A\tPlain conflict B',
        });
        await page.keyboard.press('ControlOrMeta+V');

        const importedCell = editor.locator('td', { hasText: 'Imported span' });

        await expect(importedCell).toHaveCount(1);
        await expect(importedCell).toHaveAttribute('colspan', '2');
        await expect(importedCell).toHaveAttribute('rowspan', '2');
        await expect(editor).not.toContainText('Plain conflict');

        await placeCaretInCell(importedCell, editor);
        await page.keyboard.press('ControlOrMeta+A');
        await expect(
          editor.locator(':is(td, th)[data-table-cell-selected="true"]')
        ).toHaveCount(3);

        await page.keyboard.press('ControlOrMeta+C');

        const copied = await readClipboard(page);

        expect(copied['text/html']).toContain('<td');
        expect(copied['text/html']).toContain('colspan="2"');
        expect(copied['text/html']).toContain('rowspan="2"');
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });
  });
});
