import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const EDITOR_ROOT = '[data-plite-editor="true"][contenteditable="true"]';

test('find: decorated input keeps exact history and follow-up typing', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/find-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createPliteBrowserEditorHarness(
      page,
      'find:decorated-history',
      root
    );

    await editor.ready({ editor: 'visible', text: 'This is editable text' });

    const initialBlocks = await editor.get.modelBlockTexts();
    const insertOffset = 'This is editable '.length;
    const inserted = 'qwertyuiop';
    const expectedFirst = `${initialBlocks[0].slice(
      0,
      insertOffset
    )}${inserted}${initialBlocks[0].slice(insertOffset)}`;
    const expectedAfterType = [expectedFirst, ...initialBlocks.slice(1)];

    await editor.selection.collapse({ offset: insertOffset, path: [0, 0] });
    await editor.focus();
    await editor.type(inserted);
    await editor.assert.modelBlockTexts(expectedAfterType);

    await editor.press('Enter');
    await editor.press('Enter');
    await page.keyboard.press('ControlOrMeta+z');
    await page.keyboard.press('ControlOrMeta+z');

    await editor.assert.modelBlockTexts(expectedAfterType);
    await editor.assert.text(expectedAfterType.join(''));
    await editor.assert.focusOwner('editor');

    await editor.type('x');
    await editor.assert.modelBlockText(
      0,
      `${expectedFirst.slice(0, insertOffset + inserted.length)}x${expectedFirst.slice(
        insertOffset + inserted.length
      )}`
    );
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: controlled tags restore the exact tree after undo', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/select-editor-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createPliteBrowserEditorHarness(
      page,
      'select-editor:controlled-history',
      root
    );

    await editor.ready({ editor: 'visible', text: 'Editor' });

    const initialBlocks = await editor.get.modelBlockTexts();
    const inputBlock = initialBlocks.length - 1;
    const inserted = 'qwertyuiop';
    const expectedAfterType = [...initialBlocks];

    expectedAfterType[inputBlock] = inserted;

    await editor.selection.collapse({ offset: 0, path: [inputBlock, 0] });
    await editor.focus();
    await editor.type(inserted);
    await editor.assert.modelBlockTexts(expectedAfterType);

    await editor.press('Enter');
    await editor.press('Enter');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: unknown[];
        };

        return value.children.length;
      })
      .toBe(1);
    const expectedCommitted = await editor.get.modelValue();

    await page.keyboard.press('ControlOrMeta+z');
    await page.keyboard.press('ControlOrMeta+z');

    expect(await editor.get.modelValue()).toEqual(expectedCommitted);
    await editor.assert.text(inserted);
    await editor.assert.text('Editor');
    await editor.assert.focusOwner('editor');

    const finalValue = (await editor.get.modelValue()) as {
      children: unknown[];
    };
    const finalInput = finalValue.children.length - 1;

    await editor.selection.collapse({ offset: 0, path: [finalInput, 0] });
    await editor.type('x');
    await editor.assert.text('x');
    await editor.assert.text(inserted);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: Enter preserves a query with no selectable item', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/select-editor-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createPliteBrowserEditorHarness(
      page,
      'select-editor:empty-result-enter',
      root
    );

    await editor.ready({ editor: 'visible', text: 'Editor' });
    const blockTexts = await editor.get.modelBlockTexts();
    const inputBlock = blockTexts.length - 1;

    await editor.selection.collapse({ offset: 0, path: [inputBlock, 0] });
    await editor.focus();
    await editor.type('x');
    await editor.press('Enter');

    await editor.assert.modelBlockText(inputBlock, 'x');
    await editor.assert.focusOwner('editor');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
