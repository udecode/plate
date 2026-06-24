import { expect, test } from '@playwright/test';
import {
  installPliteReactRenderProfiler,
  openExample,
  recordPliteBrowserRuntimeErrors,
  resetPliteReactRenderProfiler,
  takePliteBrowserRenderStateSnapshot,
} from '@platejs/browser/playwright';

const encodePliteFragment = (fragment: unknown) =>
  globalThis.btoa(encodeURIComponent(JSON.stringify(fragment)));

test.describe('table example', () => {
  test.beforeEach(async ({ page }) => {
    await installPliteReactRenderProfiler(page);
    await page.goto('/examples/plite/tables');
  });

  test('table tag rendered', async ({ page }) => {
    await expect(page.getByRole('textbox').locator('table')).toHaveCount(1);
  });

  test('keeps table direction stable when typing RTL text in one cell', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });
    const table = editor.root.locator('table').first();
    const readDirection = () =>
      table.evaluate((element) => ({
        computedDirection: getComputedStyle(element).direction,
        dir: element.getAttribute('dir'),
        styleDirection: (element as HTMLElement).style.direction,
      }));
    const initialDirection = await readDirection();

    await editor.selection.collapse({ path: [1, 1, 0, 0], offset: 0 });
    await editor.insertText('?שלום');

    await expect(table).toContainText('?שלום');
    await expect.poll(readDirection).toEqual(initialDirection);
  });

  test('keeps Backspace from crossing table-cell start', async ({ page }) => {
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });

    await editor.selection.collapse({ path: [1, 1, 0, 0], offset: 0 });
    await editor.root.press('Backspace');

    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('table')).toContainText('# of Feet');
    await editor.assert.selection({
      anchor: { path: [1, 1, 0, 0], offset: 0 },
      focus: { path: [1, 1, 0, 0], offset: 0 },
    });
  });

  test('keeps Delete from crossing table-cell end', async ({ page }) => {
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });

    await editor.selection.collapse({ path: [1, 0, 1, 0], offset: 5 });
    await editor.root.press('Delete');

    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('table')).toContainText('Human');
    await editor.assert.selection({
      anchor: { path: [1, 0, 1, 0], offset: 5 },
      focus: { path: [1, 0, 1, 0], offset: 5 },
    });
  });

  test('keeps Backspace after a table from deleting empty table cells', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });

    await editor.selection.collapse({ path: [2, 0], offset: 0 });
    await editor.root.press('Backspace');

    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('table')).toContainText('Human');
    await expect(editor.root.locator('table')).toContainText('# of Feet');
    await expect
      .poll(() =>
        editor.root
          .locator('tr')
          .evaluateAll((rows) =>
            rows.map((row) => row.querySelectorAll('td,th').length)
          )
      )
      .toEqual([4, 4, 4]);
    await editor.assert.selection({
      anchor: { path: [1, 2, 3, 0], offset: 1 },
      focus: { path: [1, 2, 3, 0], offset: 1 },
    });
  });

  test('keeps ArrowDown at the table end inside the last cell when the table is last', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop ArrowDown proof');

    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });
    const trailingParagraph =
      (await editor.root.locator('p').last().textContent()) ?? '';

    await editor.selection.select({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: trailingParagraph.length },
    });
    await editor.root.press('Backspace');
    await editor.selection.collapse({ path: [1, 2, 3, 0], offset: 1 });
    await editor.assert.selection({
      anchor: { path: [1, 2, 3, 0], offset: 1 },
      focus: { path: [1, 2, 3, 0], offset: 1 },
    });

    await resetPliteReactRenderProfiler(page);
    await editor.root.press('ArrowDown');
    await page.waitForTimeout(150);

    await editor.assert.selection({
      anchor: { path: [1, 2, 3, 0], offset: 1 },
      focus: { path: [1, 2, 3, 0], offset: 1 },
    });

    const proof = await takePliteBrowserRenderStateSnapshot(editor);

    expect(proof.focusOwner.kind).toBe('editor');
    expect(proof.selection).toEqual({
      anchor: { path: [1, 2, 3, 0], offset: 1 },
      focus: { path: [1, 2, 3, 0], offset: 1 },
    });
    expect(proof.selectionShells?.anchor.node?.path).toBe('1,2,3,0');
    expect(proof.selectionShells?.anchor.element?.path).toBe('1,2,3');

    await editor.root.type('X');

    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('td').last()).toHaveText('9X');
    await expect(editor.root.locator('p')).toHaveCount(1);
    await editor.assert.selection({
      anchor: { path: [1, 2, 3, 0], offset: 2 },
      focus: { path: [1, 2, 3, 0], offset: 2 },
    });
  });

  test('triple-clicking the last table cell selects only that cell text', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });
    const lastCell = editor.root.locator('td').last();

    await lastCell.click({ clickCount: 3, delay: 50 });

    await expect
      .poll(async () => (await editor.get.selectedText()).replace(/\n+$/g, ''))
      .toBe('9');
    await editor.assert.selection({
      anchor: { path: [1, 2, 3, 0], offset: 0 },
      focus: { path: [1, 2, 3, 0], offset: 1 },
    });
  });

  test('dragging within a table cell selects that cell text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop drag selection proof'
    );

    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });

    await editor.selection.dragTextRange({
      endAffinity: 'after',
      endOffset: 'Human'.length,
      settleMs: 25,
      startOffset: 0,
      text: 'Human',
    });

    await expect.poll(() => editor.get.selectedText()).toBe('Human');
    await editor.assert.selection({
      anchor: { path: [1, 0, 1, 0], offset: 0 },
      focus: { path: [1, 0, 1, 0], offset: 'Human'.length },
    });
  });

  test('dragging from a table cell toward trailing text does not select the intro paragraph', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });
    const lastCellText = editor.root
      .locator('td')
      .last()
      .locator('[data-plite-node="text"]')
      .first();
    const trailingText = editor.root
      .locator('p')
      .last()
      .locator('[data-plite-node="text"]')
      .first();
    const cellTextBox = await lastCellText.boundingBox();
    const paragraphTextBox = await trailingText.boundingBox();

    if (!cellTextBox || !paragraphTextBox) {
      throw new Error('Expected table cell and trailing paragraph text boxes');
    }

    await page.mouse.move(
      cellTextBox.x + cellTextBox.width / 2,
      cellTextBox.y + cellTextBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      paragraphTextBox.x + paragraphTextBox.width - 4,
      paragraphTextBox.y + paragraphTextBox.height / 2,
      { steps: 8 }
    );
    await page.mouse.up();

    await expect
      .poll(() => editor.get.selectedText())
      .not.toContain('Since the editor is based');
    await expect
      .poll(() => editor.get.selectedText())
      .toContain('This table is a basic rendering example');
  });

  test('keeps Enter from splitting inside a table cell', async ({ page }) => {
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });

    await editor.selection.collapse({ path: [1, 0, 1, 0], offset: 2 });
    await editor.root.press('Enter');

    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('table')).toContainText('Human');
    await editor.assert.selection({
      anchor: { path: [1, 0, 1, 0], offset: 2 },
      focus: { path: [1, 0, 1, 0], offset: 2 },
    });
  });

  test('keeps Enter stable inside an empty table cell', async ({ page }) => {
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });

    await editor.selection.collapse({ path: [1, 0, 0, 0], offset: 0 });
    await editor.root.press('Enter');

    await expect(editor.root.locator('table')).toHaveCount(1);
    await editor.assert.selection({
      anchor: { path: [1, 0, 0, 0], offset: 0 },
      focus: { path: [1, 0, 0, 0], offset: 0 },
    });

    await editor.root.type('X');
    await expect(editor.root.locator('td').first()).toHaveText('X');
    await editor.assert.selection({
      anchor: { path: [1, 0, 0, 0], offset: 1 },
      focus: { path: [1, 0, 0, 0], offset: 1 },
    });
  });

  test('pastes plain text into an empty table cell without throwing', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });

    try {
      await editor.selection.collapse({ path: [1, 0, 0, 0], offset: 0 });
      await editor.clipboard.pasteText('Pasted');

      await expect(editor.root.locator('table')).toHaveCount(1);
      await expect(editor.root.locator('td').first()).toHaveText('Pasted');
      await editor.assert.selection({
        anchor: { path: [1, 0, 0, 0], offset: 'Pasted'.length },
        focus: { path: [1, 0, 0, 0], offset: 'Pasted'.length },
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('pastes a Plite table fragment structurally without positional grid merge', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });
    const pliteFragment = encodePliteFragment([
      {
        children: [
          {
            children: [
              {
                children: [{ text: 'New 1' }],
                type: 'table-cell',
              },
              {
                children: [{ text: 'New 2' }],
                type: 'table-cell',
              },
            ],
            type: 'table-row',
          },
        ],
        type: 'table',
      },
    ]);

    try {
      await editor.selection.collapse({ path: [1, 0, 1, 0], offset: 5 });
      await editor.clipboard.pasteEventPayload({
        pliteFragment,
        text: 'New 1\tNew 2',
      });

      await expect
        .poll(() =>
          editor.root
            .locator('tr')
            .first()
            .locator('td')
            .evaluateAll((cells) => cells.map((cell) => cell.textContent ?? ''))
        )
        .toEqual(['', 'HumanNew 1', 'New 2', 'Dog', 'Cat']);
      await editor.assert.selection({
        anchor: { path: [1, 0, 2, 0], offset: 'New 2'.length },
        focus: { path: [1, 0, 2, 0], offset: 'New 2'.length },
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('moves right from an empty cell to the start of the next cell', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });

    await editor.root.locator('td').first().click();
    await editor.assert.selection({
      anchor: { path: [1, 0, 0, 0], offset: 0 },
      focus: { path: [1, 0, 0, 0], offset: 0 },
    });
    await resetPliteReactRenderProfiler(page);
    await editor.root.press('ArrowRight');

    await editor.assert.selection({
      anchor: { path: [1, 0, 1, 0], offset: 0 },
      focus: { path: [1, 0, 1, 0], offset: 0 },
    });

    const proof = await takePliteBrowserRenderStateSnapshot(editor);

    expect(proof.selection).toEqual({
      anchor: { path: [1, 0, 1, 0], offset: 0 },
      focus: { path: [1, 0, 1, 0], offset: 0 },
    });
    expect(proof.domSelection?.anchorOffset).toBe(0);
    expect(proof.focusOwner.kind).toBe('editor');
    expect(proof.selectionShells?.anchor.node?.path).toBe('1,0,1,0');
    expect(proof.selectionShells?.anchor.node?.runtimeId).toBeTruthy();
    expect(proof.selectionShells?.anchor.element?.path).toBe('1,0,1');
    expect(proof.selectionShells?.anchor.element?.isVoid).toBe(false);
    expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(2);
    expect(proof.renderCounts.total).toBeLessThanOrEqual(2);
  });

  test('moves left from a cell start to the end of the previous cell', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });

    await editor.selection.collapse({ path: [1, 0, 1, 0], offset: 0 });
    await resetPliteReactRenderProfiler(page);
    await editor.root.press('ArrowLeft');

    await editor.assert.selection({
      anchor: { path: [1, 0, 0, 0], offset: 0 },
      focus: { path: [1, 0, 0, 0], offset: 0 },
    });

    const proof = await takePliteBrowserRenderStateSnapshot(editor);

    expect(proof.selection).toEqual({
      anchor: { path: [1, 0, 0, 0], offset: 0 },
      focus: { path: [1, 0, 0, 0], offset: 0 },
    });
    expect(proof.domSelection?.anchorOffset).toBe(0);
    expect(proof.focusOwner.kind).toBe('editor');
    expect(proof.selectionShells?.anchor.node?.path).toBe('1,0,0,0');
    expect(proof.selectionShells?.anchor.node?.runtimeId).toBeTruthy();
    expect(proof.selectionShells?.anchor.element?.path).toBe('1,0,0');
    expect(proof.selectionShells?.anchor.element?.isVoid).toBe(false);
    expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(2);
    expect(proof.renderCounts.total).toBeLessThanOrEqual(2);
  });

  test('moves between table cells with Tab and Shift+Tab', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop Tab navigation proof'
    );

    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });

    await editor.selection.collapse({ path: [1, 0, 1, 0], offset: 0 });
    await editor.root.press('Tab');
    await editor.assert.selection({
      anchor: { path: [1, 0, 2, 0], offset: 0 },
      focus: { path: [1, 0, 2, 0], offset: 0 },
    });

    await editor.root.press('Shift+Tab');
    await editor.assert.selection({
      anchor: { path: [1, 0, 1, 0], offset: 0 },
      focus: { path: [1, 0, 1, 0], offset: 0 },
    });
  });

  test('does not prevent Tab at table boundaries', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop Tab navigation proof'
    );

    const editor = await openExample(page, 'plite/tables', {
      ready: { editor: 'visible' },
    });
    await page.evaluate(() => {
      document.addEventListener(
        'keydown',
        (event) => {
          if (event.key !== 'Tab') {
            return;
          }

          window.setTimeout(() => {
            document.documentElement.dataset.lastTabDefaultPrevented = String(
              event.defaultPrevented
            );
          }, 0);
        },
        { capture: true }
      );
    });
    const resetTabProbe = () =>
      page.evaluate(() => {
        delete document.documentElement.dataset.lastTabDefaultPrevented;
      });
    const lastTabDefaultPrevented = () =>
      page.evaluate(
        () => document.documentElement.dataset.lastTabDefaultPrevented ?? null
      );

    await editor.selection.collapse({ path: [1, 2, 3, 0], offset: 1 });
    await resetTabProbe();

    await editor.root.press('Tab');
    await expect.poll(lastTabDefaultPrevented).toBe('false');

    await editor.selection.collapse({ path: [1, 0, 0, 0], offset: 0 });
    await resetTabProbe();

    await editor.root.press('Shift+Tab');
    await expect.poll(lastTabDefaultPrevented).toBe('false');
  });
});
