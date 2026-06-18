import { expect, type Locator, test } from '@playwright/test';
import {
  createSlateBrowserEditorHarness,
  openExample,
  recordSlateBrowserRuntimeErrors,
  type SlateBrowserRawViewSelectionSnapshot,
} from '@platejs/browser/playwright';

const SHARED_ROOT = 'synced-block:shared:body';
const SEPARATE_ROOT = 'synced-block:separate:body';
const SHARED_BODY_FIRST = 'Shared mission statement';
const SHARED_BODY_SECOND = 'Editing any copy updates every synced copy.';

const getBrowserUndoHotkey = async (root: Locator) =>
  root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta+Z' : 'Control+Z'
    );

const getBrowserRedoHotkey = async (root: Locator) =>
  root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta+Shift+Z' : 'Control+Shift+Z'
    );

const getBrowserWordForwardHotkey = async (root: Locator) =>
  root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent)
        ? 'Alt+ArrowRight'
        : 'Control+ArrowRight'
    );

const getBrowserWordForwardSelectionHotkey = async (root: Locator) =>
  root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent)
        ? 'Alt+Shift+ArrowRight'
        : 'Control+Shift+ArrowRight'
    );

const getSyncedBlock = (
  page: Parameters<typeof openExample>[0],
  index: number
) => page.locator('[data-slate-synced-block]').nth(index);

const getSyncedBlockByRoot = (
  page: Parameters<typeof openExample>[0],
  root: string,
  index = 0
) => page.locator(`[data-slate-synced-root="${root}"]`).nth(index);

const getSyncedEditor = (
  page: Parameters<typeof openExample>[0],
  index: number
) => getSyncedBlock(page, index).locator('[data-slate-editor="true"]');

const getSyncedEditorByRoot = (
  page: Parameters<typeof openExample>[0],
  root: string,
  index = 0
) =>
  getSyncedBlockByRoot(page, root, index).locator('[data-slate-editor="true"]');

const firstSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [1],
  ownerRoot: 'main',
};

const firstSharedProjectionGraph = [
  { path: [0], root: 'main' },
  { owner: firstSharedOwner, path: [0], root: SHARED_ROOT },
];

const firstSharedProjectionGraphWithBody = [
  { path: [0], root: 'main' },
  { owner: firstSharedOwner, path: [0], root: SHARED_ROOT },
  { owner: firstSharedOwner, path: [1], root: SHARED_ROOT },
];

const focusRoot = async (
  root:
    | ReturnType<typeof getSyncedEditor>
    | ReturnType<typeof getSyncedEditorByRoot>
) => {
  await root.evaluate((element: HTMLElement) => {
    element.focus();
  });
};

const getNativeSelectionText = (page: Parameters<typeof openExample>[0]) =>
  page.evaluate(() => window.getSelection()?.toString() ?? '');

const getRenderedViewSelectionText = (
  page: Parameters<typeof openExample>[0]
) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-slate-view-selection="true"]'))
      .map((element) => element.textContent ?? '')
      .join('')
  );

const getRenderedViewSelectionTextBySharedCopy = (
  page: Parameters<typeof openExample>[0]
) =>
  page.evaluate(
    (root) =>
      Array.from(
        document.querySelectorAll(`[data-slate-synced-root="${root}"]`)
      )
        .map((block) =>
          Array.from(
            block.querySelectorAll('[data-slate-view-selection="true"]')
          )
            .map((element) => element.textContent ?? '')
            .join('')
        )
        .filter((_, index) => index === 0 || index === 1),
    SHARED_ROOT
  );

const getMountedOwnerTextChildren = (page: Parameters<typeof openExample>[0]) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-slate-synced-block]')).map(
      (block) =>
        Array.from(block.children)
          .filter((child) => child.getAttribute('data-slate-node') === 'text')
          .map((child) => ({
            path: child.getAttribute('data-slate-path'),
            text: child.textContent ?? '',
          }))
    )
  );

const hasTransparentCaret = (
  root:
    | ReturnType<typeof getSyncedEditor>
    | ReturnType<typeof getSyncedEditorByRoot>
) =>
  root.evaluate((element: HTMLElement) => {
    const caretColor = getComputedStyle(element).caretColor;

    return caretColor === 'transparent' || caretColor === 'rgba(0, 0, 0, 0)';
  });

const setSyncedBlocksProofViewport = async (
  page: Parameters<typeof openExample>[0]
) => {
  const viewport = page.viewportSize();

  await page.setViewportSize({
    height: Math.max(viewport?.height ?? 0, 1100),
    width: Math.max(viewport?.width ?? 0, 1280),
  });
};

const dragFromLocatorToLocator = async ({
  from,
  page,
  to,
}: {
  from: Locator;
  page: Parameters<typeof openExample>[0];
  to: Locator;
}) => {
  const fromBox = await from.boundingBox();
  const toBox = await to.boundingBox();

  if (!fromBox || !toBox) {
    throw new Error('Cannot drag across unmounted text locators');
  }

  await page.mouse.move(fromBox.x + fromBox.width - 1, fromBox.y + 4);
  await page.mouse.down();
  await page.mouse.move(toBox.x + Math.min(toBox.width, 18), toBox.y + 4, {
    steps: 8,
  });
  await page.mouse.up();
};

const getViewSelection = (
  root:
    | ReturnType<typeof getSyncedEditor>
    | ReturnType<typeof getSyncedEditorByRoot>
): Promise<SlateBrowserRawViewSelectionSnapshot | null> =>
  root.evaluate((element: HTMLElement) => {
    const handle = (
      element as HTMLElement & {
        __slateBrowserHandle?: {
          getViewSelection?: () => SlateBrowserRawViewSelectionSnapshot | null;
        };
      }
    ).__slateBrowserHandle;

    return handle?.getViewSelection?.() ?? null;
  });

const setViewSelection = (
  root:
    | ReturnType<typeof getSyncedEditor>
    | ReturnType<typeof getSyncedEditorByRoot>,
  selection: unknown
) =>
  root.evaluate((element: HTMLElement, nextSelection) => {
    const handle = (
      element as HTMLElement & {
        __slateBrowserHandle?: {
          setViewSelection?: (selection: unknown) => void;
        };
      }
    ).__slateBrowserHandle;

    if (!handle?.setViewSelection) {
      throw new Error('This editor surface does not expose setViewSelection');
    }

    handle.setViewSelection(nextSelection);
  }, selection);

const getProjectedNativeAffordanceMatrix = (
  root:
    | ReturnType<typeof getSyncedEditor>
    | ReturnType<typeof getSyncedEditorByRoot>
) =>
  root.evaluate((element: HTMLElement) => {
    const handle = (
      element as HTMLElement & {
        __slateBrowserHandle?: {
          getProjectedNativeAffordanceMatrix?: () => unknown;
        };
      }
    ).__slateBrowserHandle;

    return handle?.getProjectedNativeAffordanceMatrix?.() ?? null;
  });

test.describe('synced blocks example', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile') {
      await setSyncedBlocksProofViewport(page);
    }
  });

  test('smoke renders synced copies around normal paragraphs', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    await expect(page.locator('.example-page-title')).toContainText(
      'Synced Blocks'
    );
    await expect(page.locator('[data-slate-synced-block]')).toHaveCount(3);
    await expect(getSyncedEditorByRoot(page, SHARED_ROOT, 0)).toContainText(
      'Shared mission statement'
    );
    await expect(getSyncedEditorByRoot(page, SHARED_ROOT, 1)).toContainText(
      'Shared mission statement'
    );
    await expect(getSyncedEditorByRoot(page, SEPARATE_ROOT)).toContainText(
      'Separate synced document'
    );
    await expect
      .poll(() => getMountedOwnerTextChildren(page))
      .toEqual([[], [], []]);
    await expect(page.getByText('p1')).toBeVisible();
    await expect(page.getByText('p2')).toBeVisible();
  });

  test('editing one synced copy updates the other mounted copy', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
    const separateEditor = getSyncedEditorByRoot(page, SEPARATE_ROOT);
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );

    await first.selection.collapse({ path: [0, 0], offset: 0 });
    await first.insertText('Team ');

    await expect(firstEditor).toContainText('Team Shared mission statement');
    await expect(secondEditor).toContainText('Team Shared mission statement');
    await expect(separateEditor).not.toContainText('Team ');
  });

  test('undo and redo keep focus in the active synced copy', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page, {
      patterns: ['Cannot find a descendant', 'Could not set focus'],
    });

    try {
      await openExample(page, 'slate/synced-blocks', {
        ready: { editor: 'visible' },
      });

      const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
      const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
      const second = createSlateBrowserEditorHarness(
        page,
        'synced-blocks-second-copy',
        secondEditor
      );

      await second.selection.collapse({ path: [0, 0], offset: 0 });
      await focusRoot(secondEditor);
      await second.insertText('Second ');
      await expect(secondEditor).toBeFocused();
      await expect(firstEditor).toContainText(
        'Second Shared mission statement'
      );

      await second.undo();
      await expect(secondEditor).toBeFocused();
      await expect(firstEditor).not.toContainText('Second ');
      await expect(secondEditor).not.toContainText('Second ');

      await second.redo();
      await expect(secondEditor).toBeFocused();
      await expect(firstEditor).toContainText(
        'Second Shared mission statement'
      );
      await expect(secondEditor).toContainText(
        'Second Shared mission statement'
      );

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('undo and redo restore focus while walking history across main and synced roots', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page, {
      patterns: ['Cannot find a descendant', 'Could not set focus'],
    });

    try {
      await openExample(page, 'slate/synced-blocks', {
        ready: { editor: 'visible' },
      });

      const outerEditor = page.locator('[data-slate-editor="true"]').first();
      const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
      const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
      const outer = createSlateBrowserEditorHarness(
        page,
        'synced-blocks-outer',
        outerEditor
      );
      const second = createSlateBrowserEditorHarness(
        page,
        'synced-blocks-second-copy',
        secondEditor
      );

      await outer.selection.collapse({ path: [0, 0], offset: 'p1'.length });
      await focusRoot(outerEditor);
      await outer.insertText(' main');

      await second.selection.collapse({ path: [0, 0], offset: 0 });
      await focusRoot(secondEditor);
      await second.insertText(' synced');

      await outer.selection.collapse({ path: [6, 0], offset: 'p2'.length });
      await focusRoot(outerEditor);
      await outer.insertText(' tail');

      await expect(page.getByText('p1 main')).toBeVisible();
      await expect(firstEditor).toContainText(
        ' syncedShared mission statement'
      );
      await expect(secondEditor).toContainText(
        ' syncedShared mission statement'
      );
      await expect(page.getByText('p2 tail')).toBeVisible();

      const undoHotkey = await getBrowserUndoHotkey(outerEditor);
      const redoHotkey = await getBrowserRedoHotkey(outerEditor);

      await focusRoot(outerEditor);
      await outerEditor.press(undoHotkey);
      await expect(outerEditor).toBeFocused();
      await expect(page.getByText('p2 tail')).toHaveCount(0);
      await expect(page.getByText('p2')).toBeVisible();

      await page.keyboard.press(undoHotkey);
      await expect(secondEditor).toBeFocused();
      await expect(firstEditor).not.toContainText(
        ' syncedShared mission statement'
      );
      await expect(secondEditor).not.toContainText(
        ' syncedShared mission statement'
      );

      await page.keyboard.press(undoHotkey);
      await expect(outerEditor).toBeFocused();
      await expect(page.getByText('p1 main')).toHaveCount(0);
      await expect(page.getByText('p1')).toBeVisible();

      await page.keyboard.press(redoHotkey);
      await expect(outerEditor).toBeFocused();
      await expect(page.getByText('p1 main')).toBeVisible();

      await page.keyboard.press(redoHotkey);
      await expect(secondEditor).toBeFocused();
      await expect(secondEditor).toContainText(
        ' syncedShared mission statement'
      );

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('moves ArrowDown through paragraphs, separate synced roots, and repeated synced copies', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const separateEditor = getSyncedEditorByRoot(page, SEPARATE_ROOT);
    const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );
    const separate = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-separate-copy',
      separateEditor
    );
    const second = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-second-copy',
      secondEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(outerEditor);
    await outer.press('ArrowDown');

    await expect(firstEditor).toBeFocused();
    await expect.poll(() => first.selection.get()).not.toBe(null);

    await first.selection.collapse({
      path: [1, 0],
      offset: SHARED_BODY_SECOND.length,
    });
    await focusRoot(firstEditor);
    await first.press('ArrowDown');

    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toMatchObject({
        anchor: { path: [2, 0] },
        focus: { path: [2, 0] },
      });

    await outer.selection.collapse({ path: [2, 0], offset: 10 });
    await focusRoot(outerEditor);
    await outer.press('ArrowDown');

    await expect(separateEditor).toBeFocused();
    await expect.poll(() => separate.selection.get()).not.toBe(null);

    await separate.selection.collapse({
      path: [1, 0],
      offset: 'This block proves a different synced root stays isolated.'
        .length,
    });
    await focusRoot(separateEditor);
    await separate.press('ArrowDown');

    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toMatchObject({
        anchor: { path: [4, 0] },
        focus: { path: [4, 0] },
      });

    await outer.selection.collapse({ path: [4, 0], offset: 10 });
    await focusRoot(outerEditor);
    await outer.press('ArrowDown');

    await expect(secondEditor).toBeFocused();
    await expect.poll(() => second.selection.get()).not.toBe(null);

    await second.selection.collapse({
      path: [1, 0],
      offset: SHARED_BODY_SECOND.length,
    });
    await focusRoot(secondEditor);
    await second.press('ArrowDown');

    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toMatchObject({
        anchor: { path: [6, 0] },
        focus: { path: [6, 0] },
      });
  });

  test('moves ArrowUp through repeated synced copies, separate synced roots, and paragraphs', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const separateEditor = getSyncedEditorByRoot(page, SEPARATE_ROOT);
    const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );
    const separate = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-separate-copy',
      separateEditor
    );
    const second = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-second-copy',
      secondEditor
    );

    await outer.selection.collapse({ path: [6, 0], offset: 0 });
    await focusRoot(outerEditor);
    await outer.press('ArrowUp');

    await expect(secondEditor).toBeFocused();
    await expect.poll(() => second.selection.get()).not.toBe(null);

    await second.selection.collapse({ path: [0, 0], offset: 0 });
    await focusRoot(secondEditor);
    await second.press('ArrowUp');

    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toMatchObject({
        anchor: { path: [4, 0] },
        focus: { path: [4, 0] },
      });

    await outer.selection.collapse({ path: [4, 0], offset: 0 });
    await focusRoot(outerEditor);
    await outer.press('ArrowUp');

    await expect(separateEditor).toBeFocused();
    await expect.poll(() => separate.selection.get()).not.toBe(null);

    await separate.selection.collapse({ path: [0, 0], offset: 0 });
    await focusRoot(separateEditor);
    await separate.press('ArrowUp');

    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toMatchObject({
        anchor: { path: [2, 0] },
        focus: { path: [2, 0] },
      });

    await outer.selection.collapse({ path: [2, 0], offset: 0 });
    await focusRoot(outerEditor);
    await outer.press('ArrowUp');

    await expect(firstEditor).toBeFocused();
    await expect.poll(() => first.selection.get()).not.toBe(null);
  });

  test('projects Shift+Arrow across synced roots without expanding the root-local Slate selection', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(outerEditor);
    await outer.press('Shift+ArrowDown');

    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    await expect.poll(() => getNativeSelectionText(page)).not.toBe('\n');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          point: { path: [0, 0], offset: 1 },
        },
        focus: {
          owner: {
            childRoot: SHARED_ROOT,
            ownerPath: [1],
            ownerRoot: 'main',
          },
          point: {
            path: [0, 0],
            root: SHARED_ROOT,
          },
        },
        segments: {
          backward: false,
        },
      });
    await outer.assert.noDoubleSelectionHighlight();

    await outer.press('ArrowDown');

    await expect(firstEditor).toBeFocused();
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);

    await first.insertText('Projected ');
    await expect(firstEditor).toContainText('Projected ');
    await expect(secondEditor).toContainText('Projected ');

    await outer.selection.collapse({ path: [6, 0], offset: 0 });
    await focusRoot(outerEditor);
    await outer.press('Shift+ArrowUp');

    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [6, 0], offset: 0 },
        focus: { path: [6, 0], offset: 0 },
      });
    await expect.poll(() => getNativeSelectionText(page)).not.toBe('\n');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          point: { path: [6, 0], offset: 0 },
        },
        focus: {
          owner: {
            childRoot: SHARED_ROOT,
            ownerPath: [5],
            ownerRoot: 'main',
          },
          point: {
            root: SHARED_ROOT,
          },
        },
        segments: {
          backward: true,
        },
      });
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('extends Shift+Arrow through synced blocks like sibling blocks', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(outerEditor);

    await outer.press('Shift+ArrowDown');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 1 } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT },
        },
        segments: { backward: false },
      });
    await outer.assert.noDoubleSelectionHighlight();
    await outer.press('Shift+ArrowDown');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 1 } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [1, 0], root: SHARED_ROOT },
        },
        segments: { backward: false },
      });
    await outer.assert.noDoubleSelectionHighlight();

    await outer.press('Shift+ArrowDown');
    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 1 } },
        focus: { point: { path: [2, 0] } },
        segments: { backward: false },
      });
    await outer.assert.noDoubleSelectionHighlight();

    await page.keyboard.press('ArrowDown');
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);

    await outer.selection.collapse({ path: [6, 0], offset: 0 });
    await focusRoot(outerEditor);
    await outer.press('Shift+ArrowUp');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [6, 0], offset: 0 } },
        focus: {
          owner: {
            childRoot: SHARED_ROOT,
            ownerPath: [5],
            ownerRoot: 'main',
          },
          point: { root: SHARED_ROOT },
        },
        segments: { backward: true },
      });
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('extends keyboard selection from a synced content root into the owner document', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );

    await first.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'Shared mission'.length },
    });
    await expect
      .poll(() => getNativeSelectionText(page))
      .toBe('Shared mission');

    await outer.press('Shift+ArrowUp');

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT },
        },
        focus: {
          point: { path: [0, 0] },
        },
        segments: { backward: true },
      });
    await expect.poll(() => getRenderedViewSelectionText(page)).toContain('p1');
    await expect
      .poll(() => getNativeSelectionText(page))
      .not.toBe('Shared mission');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('extends keyboard selection from a synced content root into the next owner block', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );
    const selectedText = 'updates every synced';
    const selectionStart = SHARED_BODY_SECOND.indexOf(selectedText);

    await first.selection.selectDOM({
      anchor: { path: [1, 0], offset: selectionStart },
      focus: { path: [1, 0], offset: selectionStart + selectedText.length },
    });
    await expect.poll(() => getNativeSelectionText(page)).toBe(selectedText);

    await page.keyboard.press('Shift+ArrowDown');

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: { path: [1, 0], root: SHARED_ROOT },
        },
        focus: {
          point: { path: [2, 0] },
        },
        segments: { backward: false },
      });
    await expect
      .poll(() => getRenderedViewSelectionText(page))
      .toContain('Betwee');
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual([expect.stringMatching(/\S/), '']);
    await expect
      .poll(() => getNativeSelectionText(page))
      .not.toBe(selectedText);
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('extends collapsed keyboard selection from a synced content root into owner siblings', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );

    await first.selection.collapse({ path: [0, 0], offset: 0 });
    await focusRoot(firstEditor);
    await page.keyboard.press('Shift+ArrowLeft');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 0 },
        },
        focus: { point: { path: [0, 0], offset: 'p1'.length - 1 } },
        segments: { backward: true },
      });
    await outer.assert.noDoubleSelectionHighlight();

    await setViewSelection(outerEditor, null);
    await first.selection.collapse({ path: [0, 0], offset: 0 });
    await focusRoot(firstEditor);
    await outer.press('Shift+ArrowUp');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 0 },
        },
        focus: { point: { path: [0, 0] } },
        segments: { backward: true },
      });
    await outer.assert.noDoubleSelectionHighlight();

    await setViewSelection(outerEditor, null);
    await first.selection.collapse({
      path: [1, 0],
      offset: SHARED_BODY_SECOND.length,
    });
    await focusRoot(firstEditor);
    await page.keyboard.press('Shift+ArrowRight');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: SHARED_BODY_SECOND.length,
          },
        },
        focus: { point: { path: [2, 0], offset: 1 } },
        segments: { backward: false },
      });
    await outer.assert.noDoubleSelectionHighlight();

    await setViewSelection(outerEditor, null);
    await first.selection.collapse({
      path: [1, 0],
      offset: SHARED_BODY_SECOND.length,
    });
    await focusRoot(firstEditor);
    await page.keyboard.press('Shift+ArrowDown');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: SHARED_BODY_SECOND.length,
          },
        },
        focus: { point: { path: [2, 0] } },
        segments: { backward: false },
      });
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('promotes local Shift+Arrow selection from inside a synced content root into owner siblings', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );

    await first.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(firstEditor);
    await page.keyboard.press('Shift+ArrowLeft');
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await expect.poll(() => getNativeSelectionText(page)).toBe('S');

    await page.keyboard.press('Shift+ArrowLeft');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 1 },
        },
        focus: { point: { path: [0, 0], offset: 'p1'.length - 1 } },
        segments: { backward: true },
      });
    await expect.poll(() => getRenderedViewSelectionText(page)).toBe('1S');
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();

    await setViewSelection(outerEditor, null);
    await first.selection.collapse({
      path: [1, 0],
      offset: SHARED_BODY_SECOND.length - 1,
    });
    await focusRoot(firstEditor);
    await page.keyboard.press('Shift+ArrowRight');
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await expect.poll(() => getNativeSelectionText(page)).toBe('.');

    await page.keyboard.press('Shift+ArrowRight');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: SHARED_BODY_SECOND.length - 1,
          },
        },
        focus: { point: { path: [2, 0], offset: 1 } },
        segments: { backward: false },
      });
    await expect.poll(() => getRenderedViewSelectionText(page)).toBe('.B');
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('extends vertical keyboard selection from a content-root line into visible owner text', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );

    await first.selection.collapse({ path: [0, 0], offset: 'Shared'.length });
    await focusRoot(firstEditor);
    await page.keyboard.press('Shift+ArrowUp');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: {
            path: [0, 0],
            root: SHARED_ROOT,
            offset: 'Shared'.length,
          },
        },
        focus: { point: { path: [0, 0], offset: 0 } },
        segments: { backward: true },
      });
    await expect
      .poll(() => getRenderedViewSelectionText(page))
      .toBe('p1Shared');
    await outer.assert.noDoubleSelectionHighlight();

    await page.keyboard.press('Shift+ArrowUp');
    await expect
      .poll(() => getRenderedViewSelectionText(page))
      .toBe('p1Shared');

    await setViewSelection(outerEditor, null);
    await first.selection.collapse({
      path: [1, 0],
      offset: 'Editing any'.length,
    });
    await focusRoot(firstEditor);
    await page.keyboard.press('Shift+ArrowDown');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: 'Editing any'.length,
          },
        },
        focus: { point: { path: [2, 0] } },
        segments: { backward: false },
      });
    await expect
      .poll(() => getRenderedViewSelectionText(page))
      .toContain('Betwee');
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('continues vertical keyboard selection across multiple content roots', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );

    await first.selection.collapse({
      path: [1, 0],
      offset: 'Editing any'.length,
    });
    await focusRoot(firstEditor);

    await page.keyboard.press('Shift+ArrowDown');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: 'Editing any'.length,
          },
        },
        focus: {
          point: { path: [2, 0], offset: 'Editing any'.length },
        },
        segments: { backward: false },
      });
    await expect
      .poll(() => getRenderedViewSelectionText(page))
      .toContain('Between syn');
    await outer.assert.noDoubleSelectionHighlight();

    await page.keyboard.press('Shift+ArrowDown');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: 'Editing any'.length,
          },
        },
        focus: {
          owner: {
            childRoot: SEPARATE_ROOT,
            ownerPath: [3],
            ownerRoot: 'main',
          },
          point: {
            path: [0, 0],
            root: SEPARATE_ROOT,
            offset: 'Editing any'.length,
          },
        },
        segments: { backward: false },
      });
    await expect
      .poll(() => getRenderedViewSelectionText(page))
      .toContain('Separate sy');
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('extends projected vertical selection to the document-bottom line end before no-op', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );
    const anchorOffset = SHARED_BODY_SECOND.indexOf('updates');

    await first.selection.collapse({
      path: [1, 0],
      offset: anchorOffset,
    });
    await focusRoot(firstEditor);

    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Shift+ArrowDown');
    }

    const getDocumentBottomFocusOffset = async () => {
      const selection = await getViewSelection(outerEditor);
      const point = selection?.focus.point;

      if (
        !point ||
        point.path.length !== 2 ||
        point.path[0] !== 6 ||
        point.path[1] !== 0
      ) {
        return -1;
      }

      return point.offset;
    };

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: anchorOffset,
          },
        },
        focus: { point: { path: [6, 0] } },
        segments: { backward: false },
      });
    await expect
      .poll(getDocumentBottomFocusOffset)
      .toBeGreaterThanOrEqual('p'.length);
    await expect
      .poll(getDocumentBottomFocusOffset)
      .toBeLessThanOrEqual('p2'.length);
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();

    await page.keyboard.press('Shift+ArrowDown');

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: anchorOffset,
          },
        },
        focus: { point: { path: [6, 0], offset: 'p2'.length } },
        segments: { backward: false },
      });
    await expect.poll(() => getRenderedViewSelectionText(page)).toContain('p2');
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();

    await page.keyboard.press('Shift+ArrowDown');

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: anchorOffset,
          },
        },
        focus: { point: { path: [6, 0], offset: 'p2'.length } },
        segments: { backward: false },
      });
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('keeps left-edge vertical selection from overselecting the synced root line', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 0 });
    await focusRoot(outerEditor);
    await outer.press('Shift+ArrowDown');

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 0 } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 0 },
        },
        segments: { backward: false },
      });
    await expect.poll(() => getRenderedViewSelectionText(page)).toContain('p1');
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual(['', '']);
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('mouse selection across synced blocks becomes the same visible-order selection as sibling blocks', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);

    await dragFromLocatorToLocator({
      from: outerEditor.getByText('p1', { exact: true }),
      page,
      to: firstEditor.getByText(SHARED_BODY_FIRST, { exact: true }),
    });

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          point: { path: [0, 0] },
        },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT },
        },
        segments: { backward: false },
      });
    await expect.poll(() => getNativeSelectionText(page)).not.toBe('\n');
    await expect
      .poll(() => getNativeSelectionText(page))
      .not.toContain('Editing original');
    await outer.assert.noDoubleSelectionHighlight();

    await setViewSelection(outerEditor, null);
    await dragFromLocatorToLocator({
      from: firstEditor.getByText(SHARED_BODY_SECOND, { exact: true }),
      page,
      to: outerEditor.getByText('Between synced copies.', { exact: true }),
    });

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: { path: [1, 0], root: SHARED_ROOT },
        },
        focus: {
          point: { path: [2, 0] },
        },
        segments: { backward: false },
      });
    await expect.poll(() => getNativeSelectionText(page)).not.toBe('\n');
    await expect
      .poll(() => getNativeSelectionText(page))
      .not.toContain('Editing original');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('mouse drag from a synced content root into the owner document selects both sides', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const from = firstEditor.getByText(SHARED_BODY_FIRST, { exact: true });
    const to = outerEditor.getByText('Between synced copies.', {
      exact: true,
    });
    const fromBox = await from.boundingBox();
    const toBox = await to.boundingBox();

    if (!fromBox || !toBox) {
      throw new Error('Cannot drag from synced body into owner text');
    }

    await page.mouse.move(
      fromBox.x + fromBox.width * 0.45,
      fromBox.y + fromBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(toBox.x + toBox.width * 0.45, toBox.y + 4, {
      steps: 16,
    });
    await page.mouse.up();

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT },
        },
        focus: {
          point: { path: [2, 0] },
        },
        segments: { backward: false },
      });
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual([expect.stringContaining('statement'), '']);
    await expect
      .poll(() => getRenderedViewSelectionText(page))
      .toContain('Between');
    await expect
      .poll(() => getNativeSelectionText(page))
      .not.toContain('Editing original');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('mouse drag from an existing synced root text selection into the owner document selects both sides', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox selected-text pointer drag leaves projected view selection null instead of selecting across synced roots'
    );

    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );

    await first.selection.selectAll();
    await focusRoot(firstEditor);
    await first.insertText('not so good!');
    await first.selection.selectDOM({
      anchor: { path: [0, 0], offset: 'not so '.length },
      focus: { path: [0, 0], offset: 'not so good'.length },
    });

    await expect.poll(() => getNativeSelectionText(page)).toBe('good');

    const fromBox = await first.selection.rect();
    const to = outerEditor.getByText('Between synced copies.', {
      exact: true,
    });
    const toBox = await to.boundingBox();

    if (!fromBox || !toBox) {
      throw new Error('Cannot drag selected synced text into owner text');
    }

    await page.mouse.move(
      fromBox.x + fromBox.width / 2,
      fromBox.y + fromBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(toBox.x + toBox.width * 0.55, toBox.y + 4, {
      steps: 16,
    });
    await page.mouse.up();

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT },
        },
        focus: {
          point: { path: [2, 0] },
        },
        segments: { backward: false },
      });
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual([expect.stringMatching(/\S/), '']);
    await expect
      .poll(() => getRenderedViewSelectionText(page))
      .toContain('Between');
    await expect
      .poll(() => getNativeSelectionText(page))
      .not.toContain('Editing original');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('mouse drag can select from p1 through repeated synced roots to p2', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Mobile viewport pointer drag wraps before reaching repeated synced roots'
    );

    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const p1 = outerEditor.getByText('p1', { exact: true });
    const p2 = outerEditor.getByText('p2', { exact: true });
    const p1Box = await p1.boundingBox();
    const p2Box = await p2.boundingBox();

    if (!p1Box || !p2Box) {
      throw new Error('Cannot drag across p1 and p2');
    }

    await page.mouse.move(p1Box.x + 1, p1Box.y + p1Box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      p2Box.x + p2Box.width - 1,
      p2Box.y + p2Box.height / 2,
      {
        steps: 16,
      }
    );
    await page.mouse.up();

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          point: { path: [0, 0] },
        },
        focus: {
          point: { path: [6, 0] },
        },
        segments: { backward: false },
      });
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual([
        `${SHARED_BODY_FIRST}${SHARED_BODY_SECOND}`,
        `${SHARED_BODY_FIRST}${SHARED_BODY_SECOND}`,
      ]);
    await expect.poll(() => getRenderedViewSelectionText(page)).toContain('p2');
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('mouse drag through synced block chrome does not project owner text nodes', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page, {
      patterns: ['Cannot resolve projected point'],
    });

    try {
      await openExample(page, 'slate/synced-blocks', {
        ready: { editor: 'visible' },
      });

      const outerEditor = page.locator('[data-slate-editor="true"]').first();
      const outer = createSlateBrowserEditorHarness(
        page,
        'synced-blocks-outer',
        outerEditor
      );
      const firstBlock = getSyncedBlockByRoot(page, SHARED_ROOT, 0);
      const thirdBlock = getSyncedBlockByRoot(page, SHARED_ROOT, 1);
      const firstBox = await firstBlock.boundingBox();
      const thirdBox = await thirdBlock.boundingBox();

      if (!firstBox || !thirdBox) {
        throw new Error('Cannot drag across synced block chrome');
      }

      await page.mouse.move(
        firstBox.x + firstBox.width / 2,
        firstBox.y + firstBox.height * 0.25
      );
      await page.mouse.down();
      await page.mouse.move(
        thirdBox.x + thirdBox.width / 2,
        thirdBox.y + thirdBox.height / 2,
        { steps: 12 }
      );
      await page.mouse.up();

      runtimeErrors.assertNone();
      await expect
        .poll(() => getViewSelection(outerEditor))
        .toMatchObject({
          anchor: {
            point: { path: [0, 0] },
          },
          focus: {
            owner: {
              childRoot: SHARED_ROOT,
              ownerPath: [5],
              ownerRoot: 'main',
            },
            point: { root: SHARED_ROOT },
          },
          segments: { backward: false },
        });
      await outer.assert.noDoubleSelectionHighlight();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('mouse drag updates selection before mouseup after first-focus mousedown', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Mobile viewport pointer drag wraps before reaching repeated synced roots'
    );

    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const p1 = outerEditor.getByText('p1', { exact: true });
    const p2 = outerEditor.getByText('p2', { exact: true });
    const p1Box = await p1.boundingBox();
    const p2Box = await p2.boundingBox();

    if (!p1Box || !p2Box) {
      throw new Error('Cannot drag across p1 and p2');
    }

    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });

    await page.mouse.move(p1Box.x + 1, p1Box.y + p1Box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      p2Box.x + p2Box.width - 1,
      p2Box.y + p2Box.height / 2,
      {
        steps: 16,
      }
    );

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          point: { path: [0, 0] },
        },
        focus: {
          point: { path: [6, 0] },
        },
        segments: { backward: false },
      });
    await expect.poll(() => getRenderedViewSelectionText(page)).toContain('p2');
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();

    await page.mouse.up();
  });

  test('buttonless mousemove after mouseup outside does not reuse stale projected drag', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const p1 = outerEditor.getByText('p1', { exact: true });
    const p2 = outerEditor.getByText('p2', { exact: true });
    const p1Box = await p1.boundingBox();
    const p2Box = await p2.boundingBox();

    if (!p1Box || !p2Box) {
      throw new Error('Cannot inspect p1 and p2 for stale drag proof');
    }

    await page.mouse.move(p1Box.x + 1, p1Box.y + p1Box.height / 2);
    await page.mouse.down();
    await page.mouse.move(2, 2);
    await page.mouse.up();
    await page.mouse.move(p2Box.x + 1, p2Box.y + p2Box.height / 2);

    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('extends Shift+ArrowLeft and Shift+ArrowRight through synced blocks like sibling text', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 'p1'.length });
    await focusRoot(outerEditor);
    await outer.press('Shift+ArrowRight');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 'p1'.length } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 1 },
        },
        segments: { backward: false },
      });

    await outer.press('Shift+ArrowRight');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 'p1'.length } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 2 },
        },
        segments: { backward: false },
      });
    await outer.assert.noDoubleSelectionHighlight();

    await setViewSelection(outerEditor, null);
    await outer.selection.collapse({ path: [6, 0], offset: 0 });
    await focusRoot(outerEditor);
    await outer.press('Shift+ArrowLeft');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [6, 0], offset: 0 } },
        focus: {
          owner: {
            childRoot: SHARED_ROOT,
            ownerPath: [5],
            ownerRoot: 'main',
          },
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: SHARED_BODY_SECOND.length - 1,
          },
        },
        segments: { backward: true },
      });

    await outer.press('Shift+ArrowLeft');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [6, 0], offset: 0 } },
        focus: {
          owner: {
            childRoot: SHARED_ROOT,
            ownerPath: [5],
            ownerRoot: 'main',
          },
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: SHARED_BODY_SECOND.length - 2,
          },
        },
        segments: { backward: true },
      });
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('clears native selection when backward local selection becomes projected', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.select({
      anchor: { path: [6, 0], offset: 1 },
      focus: { path: [6, 0], offset: 0 },
    });
    await focusRoot(outerEditor);
    await outer.press('Shift+ArrowLeft');

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [6, 0], offset: 1 } },
        focus: {
          owner: {
            childRoot: SHARED_ROOT,
            ownerPath: [5],
            ownerRoot: 'main',
          },
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: SHARED_BODY_SECOND.length - 1,
          },
        },
        segments: { backward: true },
      });
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('renders projected Shift+ArrowRight selection on the active synced block copy', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 'p1'.length });
    await focusRoot(outerEditor);
    await page.keyboard.press('Shift+ArrowRight');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 'p1'.length } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 1 },
        },
        segments: { backward: false },
      });
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual(['S', '']);
    await expect.poll(() => hasTransparentCaret(outerEditor)).toBe(true);
    await expect.poll(() => hasTransparentCaret(firstEditor)).toBe(true);

    await page.keyboard.press('Shift+ArrowRight');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 'p1'.length } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 2 },
        },
        segments: { backward: false },
      });
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual(['Sh', '']);
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('keeps ordinary Shift+Arrow selection local inside normal paragraphs', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 0 });
    await focusRoot(outerEditor);
    await outer.press('Shift+ArrowRight');

    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await expect.poll(() => hasTransparentCaret(outerEditor)).toBe(false);
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      });
    await expect.poll(() => getNativeSelectionText(page)).toBe('p');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('promotes expanded Shift+ArrowRight at synced-block boundary without native overselection', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(outerEditor);

    await outer.press('Shift+ArrowRight');
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 'p1'.length },
      });
    await expect.poll(() => getNativeSelectionText(page)).toBe('1');

    await outer.press('Shift+ArrowRight');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 1 } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 1 },
        },
        segments: { backward: false },
      });
    await expect.poll(() => getRenderedViewSelectionText(page)).toBe('1S');
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();

    await outer.press('Shift+ArrowRight');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 1 } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 2 },
        },
        segments: { backward: false },
      });
    await expect.poll(() => getRenderedViewSelectionText(page)).toBe('1Sh');
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual(['Sh', '']);
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('extends word selection from the projected synced-block focus', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const wordForwardSelection =
      await getBrowserWordForwardSelectionHotkey(outerEditor);

    await outer.selection.collapse({ path: [0, 0], offset: 'p1'.length });
    await focusRoot(outerEditor);
    await outer.press('Shift+ArrowRight');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 'p1'.length } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 1 },
        },
      });

    await outer.press(wordForwardSelection);
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 'p1'.length } },
        focus: {
          owner: firstSharedOwner,
          point: {
            path: [0, 0],
            root: SHARED_ROOT,
            offset: 'Shared'.length,
          },
        },
        segments: { backward: false },
      });
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('typing over a projected Shift+Arrow selection replaces text across the outer and synced roots', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(outerEditor);
    await setViewSelection(outerEditor, {
      anchor: { point: { path: [0, 0], offset: 1 } },
      focus: {
        owner: firstSharedOwner,
        point: { path: [0, 0], root: SHARED_ROOT, offset: 2 },
      },
      graph: firstSharedProjectionGraph,
    });
    await expect.poll(() => getViewSelection(outerEditor)).not.toBe(null);
    await expect.poll(() => getRenderedViewSelectionText(page)).toBe('1Sh');
    await outer.assert.noDoubleSelectionHighlight();

    await page.keyboard.type('X');

    const syncedRemainder = SHARED_BODY_FIRST.slice(2);

    await expect(page.getByText('pX')).toBeVisible();
    await expect(firstEditor).toContainText(syncedRemainder);
    await expect(firstEditor).not.toContainText(SHARED_BODY_FIRST);
    await expect(secondEditor).toContainText(syncedRemainder);
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });

    await outer.undo();

    await expect(page.getByText('p1')).toBeVisible();
    await expect(firstEditor).toContainText(SHARED_BODY_FIRST);
    await expect(secondEditor).toContainText(SHARED_BODY_FIRST);
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 2 },
        },
      });

    await outer.redo();

    await expect(page.getByText('pX')).toBeVisible();
    await expect(firstEditor).toContainText(syncedRemainder);
    await expect(secondEditor).toContainText(syncedRemainder);
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
  });

  test('Backspace over a projected Shift+Arrow selection removes text across the outer and synced roots', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(outerEditor);
    await setViewSelection(outerEditor, {
      anchor: { point: { path: [0, 0], offset: 1 } },
      focus: {
        owner: firstSharedOwner,
        point: { path: [0, 0], root: SHARED_ROOT, offset: 2 },
      },
      graph: firstSharedProjectionGraph,
    });
    await expect.poll(() => getViewSelection(outerEditor)).not.toBe(null);
    await expect.poll(() => getRenderedViewSelectionText(page)).toBe('1Sh');
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual(['Sh', '']);
    await outer.assert.noDoubleSelectionHighlight();

    await page.keyboard.press('Backspace');

    const syncedRemainder = SHARED_BODY_FIRST.slice(2);

    await expect(outerEditor.getByText('p', { exact: true })).toBeVisible();
    await expect(firstEditor).toContainText(syncedRemainder);
    await expect(firstEditor).not.toContainText(SHARED_BODY_FIRST);
    await expect(secondEditor).toContainText(syncedRemainder);
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
  });

  test('Enter over a projected Shift+Arrow selection inserts a paragraph break across the outer and synced roots', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page, {
      patterns: ['Cannot find a descendant', 'Could not set focus'],
    });

    try {
      await openExample(page, 'slate/synced-blocks', {
        ready: { editor: 'visible' },
      });

      const outerEditor = page.locator('[data-slate-editor="true"]').first();
      const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
      const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
      const outer = createSlateBrowserEditorHarness(
        page,
        'synced-blocks-outer',
        outerEditor
      );

      await outer.selection.collapse({ path: [0, 0], offset: 1 });
      await focusRoot(outerEditor);
      await setViewSelection(outerEditor, {
        anchor: { point: { path: [0, 0], offset: 1 } },
        focus: {
          owner: firstSharedOwner,
          point: { path: [0, 0], root: SHARED_ROOT, offset: 2 },
        },
        graph: firstSharedProjectionGraph,
      });
      await expect.poll(() => getViewSelection(outerEditor)).not.toBe(null);
      await expect.poll(() => getRenderedViewSelectionText(page)).toBe('1Sh');
      await expect
        .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
        .toEqual(['Sh', '']);
      await outer.assert.noDoubleSelectionHighlight();

      await page.keyboard.press('Enter');

      const syncedRemainder = SHARED_BODY_FIRST.slice(2);

      await expect(outerEditor.getByText('p', { exact: true })).toBeVisible();
      await expect(firstEditor).toContainText(syncedRemainder);
      await expect(firstEditor).not.toContainText(SHARED_BODY_FIRST);
      await expect(secondEditor).toContainText(syncedRemainder);
      await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
      await expect
        .poll(() => outer.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('Backspace over a projected selection from a synced body into the owner document deletes without crashing', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page, {
      patterns: ['Cannot find a descendant', 'Could not set focus'],
    });

    try {
      await openExample(page, 'slate/synced-blocks', {
        ready: { editor: 'visible' },
      });

      const outerEditor = page.locator('[data-slate-editor="true"]').first();
      const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
      const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
      const first = createSlateBrowserEditorHarness(
        page,
        'synced-blocks-first-copy',
        firstEditor
      );
      const outer = createSlateBrowserEditorHarness(
        page,
        'synced-blocks-outer',
        outerEditor
      );
      const anchorOffset = SHARED_BODY_SECOND.indexOf('any');
      const selectedText = SHARED_BODY_SECOND.slice(anchorOffset);

      await first.selection.selectDOM({
        anchor: { path: [1, 0], offset: anchorOffset },
        focus: { path: [1, 0], offset: SHARED_BODY_SECOND.length },
      });
      await expect.poll(() => getNativeSelectionText(page)).toBe(selectedText);
      await focusRoot(firstEditor);

      await page.keyboard.press('Shift+ArrowDown');

      await expect
        .poll(async () => ({
          rendered: await getRenderedViewSelectionText(page),
          viewSelection: await getViewSelection(outerEditor),
        }))
        .toMatchObject({
          rendered: expect.stringContaining(
            'any copy updates every synced copy.Between synced copies.'
          ),
          viewSelection: {
            anchor: {
              owner: firstSharedOwner,
              point: {
                path: [1, 0],
                root: SHARED_ROOT,
                offset: anchorOffset,
              },
            },
            focus: {
              point: { path: [2, 0] },
            },
            segments: { backward: false },
          },
        });
      await outer.assert.noDoubleSelectionHighlight();
      await expect
        .poll(() => getNativeSelectionText(page))
        .not.toBe(selectedText);

      await page.keyboard.press('Backspace');

      await expect
        .poll(() => first.get.modelText())
        .toBe(`${SHARED_BODY_FIRST}Editing `);
      await expect
        .poll(() =>
          createSlateBrowserEditorHarness(
            page,
            'synced-blocks-second-copy',
            secondEditor
          ).get.modelText()
        )
        .toBe(`${SHARED_BODY_FIRST}Editing `);
      await expect
        .poll(() => outer.get.modelText())
        .toBe('p1Between synced documents.p2');
      await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
      await expect.poll(() => getNativeSelectionText(page)).toBe('');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('Enter over a projected selection from a synced body into the owner document inserts a paragraph break without crashing', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page, {
      patterns: ['Cannot find a descendant', 'Could not set focus'],
    });

    try {
      await openExample(page, 'slate/synced-blocks', {
        ready: { editor: 'visible' },
      });

      const outerEditor = page.locator('[data-slate-editor="true"]').first();
      const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
      const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
      const first = createSlateBrowserEditorHarness(
        page,
        'synced-blocks-first-copy',
        firstEditor
      );
      const outer = createSlateBrowserEditorHarness(
        page,
        'synced-blocks-outer',
        outerEditor
      );
      const anchorOffset = SHARED_BODY_SECOND.indexOf('any');
      const selectedText = SHARED_BODY_SECOND.slice(anchorOffset);

      await first.selection.selectDOM({
        anchor: { path: [1, 0], offset: anchorOffset },
        focus: { path: [1, 0], offset: SHARED_BODY_SECOND.length },
      });
      await expect.poll(() => getNativeSelectionText(page)).toBe(selectedText);
      await focusRoot(firstEditor);

      await page.keyboard.press('Shift+ArrowDown');

      await expect
        .poll(async () => ({
          rendered: await getRenderedViewSelectionText(page),
          viewSelection: await getViewSelection(outerEditor),
        }))
        .toMatchObject({
          rendered: expect.stringContaining(
            'any copy updates every synced copy.Between synced copies.'
          ),
          viewSelection: expect.any(Object),
        });
      await outer.assert.noDoubleSelectionHighlight();

      await page.keyboard.press('Enter');

      await expect
        .poll(() => first.get.modelText())
        .toBe(`${SHARED_BODY_FIRST}Editing `);
      await expect
        .poll(() =>
          createSlateBrowserEditorHarness(
            page,
            'synced-blocks-second-copy',
            secondEditor
          ).get.modelText()
        )
        .toBe(`${SHARED_BODY_FIRST}Editing `);
      await expect
        .poll(() => first.selection.get())
        .toEqual({
          anchor: { path: [2, 0], offset: 0 },
          focus: { path: [2, 0], offset: 0 },
        });
      await expect
        .poll(() => outer.get.modelText())
        .toBe('p1Between synced documents.p2');
      await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
      await expect.poll(() => getNativeSelectionText(page)).toBe('');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('Delete after native selection inside a synced body keeps the outer document mounted', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page, {
      patterns: ['Cannot find a descendant', 'Could not set focus'],
    });

    try {
      await openExample(page, 'slate/synced-blocks', {
        ready: { editor: 'visible' },
      });

      const outerEditor = page.locator('[data-slate-editor="true"]').first();
      const firstBlock = getSyncedBlockByRoot(page, SHARED_ROOT, 0);
      const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
      const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
      const first = createSlateBrowserEditorHarness(
        page,
        'synced-blocks-first-copy',
        firstEditor
      );

      await first.selection.selectDOM({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: SHARED_BODY_SECOND.length },
      });

      await expect
        .poll(async () =>
          (await getNativeSelectionText(page)).split('\n').filter(Boolean)
        )
        .toEqual([SHARED_BODY_FIRST, SHARED_BODY_SECOND]);

      await page.keyboard.press('Delete');

      await expect(page.getByText('p1')).toBeVisible();
      await expect(page.getByText('Between synced copies.')).toBeVisible();
      await expect(page.getByText('Between synced documents.')).toBeVisible();
      await expect(page.getByText('p2')).toBeVisible();
      await expect(firstEditor).toContainText('Empty synced block');
      await expect(secondEditor).toContainText('Empty synced block');
      await expect(firstEditor).not.toContainText(SHARED_BODY_FIRST);
      await expect(secondEditor).not.toContainText(SHARED_BODY_SECOND);
      await expect(page.locator('[data-slate-editor="true"]')).toHaveCount(4);
      await expect
        .poll(async () => {
          const bodyBox = await firstBlock
            .locator('.slate-synced-blocks-synced-block-body')
            .boundingBox();
          const placeholderBox = await firstEditor
            .locator('[data-slate-placeholder="true"]')
            .boundingBox();

          if (!bodyBox || !placeholderBox) {
            return null;
          }

          return {
            leftDelta: Math.round(placeholderBox.x - bodyBox.x),
            topDelta: Math.round(placeholderBox.y - bodyBox.y),
          };
        })
        .toEqual({
          leftDelta: 8,
          topDelta: 8,
        });
      await expect
        .poll(() =>
          outerEditor.evaluate((element: HTMLElement) => {
            const handle = (
              element as HTMLElement & {
                __slateBrowserHandle?: {
                  getLastCommit?: () => {
                    operations?: { root?: string; type: string }[];
                  } | null;
                };
              }
            ).__slateBrowserHandle;

            return (
              handle
                ?.getLastCommit?.()
                ?.operations?.filter(
                  (operation) => operation.type !== 'set_selection'
                )
                .map((operation) => operation.root ?? 'main') ?? []
            );
          })
        )
        .toEqual([SHARED_ROOT]);

      await page.keyboard.type('w');

      await expect(firstEditor).toContainText('w');
      await expect(secondEditor).toContainText('w');
      await expect(firstEditor).not.toContainText('Empty synced block');
      expect(
        await createSlateBrowserEditorHarness(
          page,
          'synced-blocks-first-copy-after-empty',
          firstEditor
        ).get.modelText()
      ).toBe('w');
      await page.keyboard.press('Backspace');

      await expect(firstEditor).toContainText('Empty synced block');
      await expect(secondEditor).toContainText('Empty synced block');
      expect(
        await createSlateBrowserEditorHarness(
          page,
          'synced-blocks-first-copy-after-backspace',
          firstEditor
        ).get.modelText()
      ).toBe('');

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('copies a projected selection from visible order instead of root-local DOM selection', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(outerEditor);
    await setViewSelection(outerEditor, {
      anchor: { point: { path: [0, 0], offset: 1 } },
      focus: {
        owner: firstSharedOwner,
        point: { path: [0, 0], root: SHARED_ROOT, offset: 2 },
      },
      graph: firstSharedProjectionGraph,
    });
    await expect.poll(() => getRenderedViewSelectionText(page)).toBe('1Sh');
    await outer.assert.noDoubleSelectionHighlight();

    const payload = await outer.clipboard.copyEventPayload();

    expect(payload.types).toEqual(
      expect.arrayContaining([
        'application/x-slate-fragment',
        'text/html',
        'text/plain',
      ])
    );
    expect(payload.text).toBe('1\nSh');
    expect(payload.html).toContain('data-slate-fragment=');
  });

  test('classifies projected selection native affordances without claiming native parity', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(outerEditor);
    await setViewSelection(outerEditor, {
      anchor: { point: { path: [0, 0], offset: 1 } },
      focus: {
        owner: firstSharedOwner,
        point: { path: [0, 0], root: SHARED_ROOT, offset: 2 },
      },
      graph: firstSharedProjectionGraph,
    });

    const nativeSelectionText = await getNativeSelectionText(page);
    const matrix = await getProjectedNativeAffordanceMatrix(outerEditor);

    await expect.poll(() => getRenderedViewSelectionText(page)).toBe('1Sh');
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual(['Sh', '']);
    expect(nativeSelectionText).not.toBe('1\nSh');
    await outer.assert.noDoubleSelectionHighlight();
    expect(matrix).toMatchObject({
      clipboard: { status: 'supported' },
      find: { status: 'degraded' },
      ime: { status: 'degraded' },
      mobileSelection: { status: 'unsupported' },
      screenReader: { status: 'degraded' },
      spellcheck: { status: 'degraded' },
    });
  });

  test('moves ArrowLeft and ArrowRight through the active repeated synced copy', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const second = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-second-copy',
      secondEditor
    );

    await outer.selection.collapse({
      path: [4, 0],
      offset: 'Between synced documents.'.length,
    });
    await focusRoot(outerEditor);
    await outer.press('ArrowRight');

    await expect(secondEditor).toBeFocused();
    await expect
      .poll(() => second.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await outer.assert.noDoubleSelectionHighlight();

    await second.selection.collapse({
      path: [1, 0],
      offset: SHARED_BODY_SECOND.length,
    });
    await focusRoot(secondEditor);
    await second.press('ArrowRight');

    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [6, 0], offset: 0 },
        focus: { path: [6, 0], offset: 0 },
      });
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await outer.assert.noDoubleSelectionHighlight();

    await outer.selection.collapse({ path: [6, 0], offset: 0 });
    await focusRoot(outerEditor);
    await outer.press('ArrowLeft');

    await expect(secondEditor).toBeFocused();
    await expect
      .poll(() => second.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: SHARED_BODY_SECOND.length },
        focus: { path: [1, 0], offset: SHARED_BODY_SECOND.length },
      });
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await outer.assert.noDoubleSelectionHighlight();

    await second.selection.collapse({ path: [0, 0], offset: 0 });
    await focusRoot(secondEditor);
    await second.press('ArrowLeft');

    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: {
          path: [4, 0],
          offset: 'Between synced documents.'.length,
        },
        focus: {
          path: [4, 0],
          offset: 'Between synced documents.'.length,
        },
      });
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('moves word navigation into synced root blocks instead of skipping them', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const firstEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 0);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );
    const wordForward = await getBrowserWordForwardHotkey(outerEditor);

    await outer.selection.collapse({ path: [0, 0], offset: 'p1'.length });
    await focusRoot(outerEditor);
    await outer.press(wordForward);

    await expect(firstEditor).toBeFocused();
    await expect
      .poll(() => first.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 'Shared'.length },
        focus: { path: [0, 0], offset: 'Shared'.length },
      });
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('Cmd+Arrow jumps between the active synced copy and document boundaries', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const second = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-second-copy',
      secondEditor
    );
    await second.selection.collapse({ path: [0, 0], offset: 0 });
    await focusRoot(secondEditor);
    await second.press('Meta+ArrowDown');

    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [6, 0], offset: 'p2'.length },
        focus: { path: [6, 0], offset: 'p2'.length },
      });
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await outer.assert.noDoubleSelectionHighlight();

    await outer.press('Meta+ArrowUp');

    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('Cmd+Shift+Arrow extends selection between synced copies and document boundaries', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const secondEditor = getSyncedEditorByRoot(page, SHARED_ROOT, 1);
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const second = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-second-copy',
      secondEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(outerEditor);
    await outer.press('Meta+Shift+ArrowDown');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 1 } },
        focus: { point: { path: [6, 0], offset: 'p2'.length } },
        segments: { backward: false },
      });
    await outer.assert.noDoubleSelectionHighlight();

    await setViewSelection(outerEditor, null);
    await second.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(secondEditor);
    await second.press('Meta+Shift+ArrowUp');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: {
            childRoot: SHARED_ROOT,
            ownerPath: [5],
            ownerRoot: 'main',
          },
          point: { path: [0, 0], root: SHARED_ROOT, offset: 1 },
        },
        focus: { point: { path: [0, 0], offset: 0 } },
        segments: { backward: true },
      });
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('Cmd+Shift+ArrowRight extends projected synced-block focus to block end', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 0 });
    await focusRoot(outerEditor);
    await setViewSelection(outerEditor, {
      anchor: { point: { path: [0, 0], offset: 0 } },
      focus: {
        owner: firstSharedOwner,
        point: {
          path: [1, 0],
          root: SHARED_ROOT,
          offset: 'Editing'.length,
        },
      },
      graph: firstSharedProjectionGraphWithBody,
    });

    await outer.press('Meta+Shift+ArrowRight');

    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: { point: { path: [0, 0], offset: 0 } },
        focus: {
          owner: firstSharedOwner,
          point: {
            path: [1, 0],
            root: SHARED_ROOT,
            offset: SHARED_BODY_SECOND.length,
          },
        },
        segments: { backward: false },
      });
    await expect
      .poll(() => getRenderedViewSelectionTextBySharedCopy(page))
      .toEqual([`${SHARED_BODY_FIRST}${SHARED_BODY_SECOND}`, '']);
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('keeps model-owned select-all highlight clear when Shift+ArrowUp creates projected selection', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );

    await outer.selection.collapse({ path: [0, 0], offset: 1 });
    await focusRoot(outerEditor);
    await page.keyboard.press('ControlOrMeta+A');

    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [6, 0], offset: 2 },
      });
    await expect.poll(() => getNativeSelectionText(page)).toBe('');

    await outer.press('Shift+ArrowUp');

    await expect.poll(() => getViewSelection(outerEditor)).not.toBe(null);
    await expect.poll(() => getRenderedViewSelectionText(page)).toContain('p1');
    await expect.poll(() => getNativeSelectionText(page)).toBe('');
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('clicking outside a synced block moves focus back to the outer editor', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    const outerEditor = page.locator('[data-slate-editor="true"]').first();
    const outer = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-outer',
      outerEditor
    );
    const firstEditor = getSyncedEditor(page, 0);
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );

    await first.selection.collapse({ path: [0, 0], offset: 0 });
    await firstEditor.evaluate((element: HTMLElement) => {
      element.focus();
    });
    await expect(firstEditor).toBeFocused();

    await page.getByText('p2').click();

    await expect(outerEditor).toBeFocused();
    await expect(firstEditor).not.toBeFocused();
    await expect.poll(() => getViewSelection(outerEditor)).toBe(null);
    await outer.assert.noDoubleSelectionHighlight();
  });

  test('duplicate shares the root and unsync clones one copy', async ({
    page,
  }) => {
    await openExample(page, 'slate/synced-blocks', {
      ready: { editor: 'visible' },
    });

    await page
      .getByRole('button', { name: 'Duplicate synced block' })
      .first()
      .click();
    await expect(page.locator('[data-slate-synced-block]')).toHaveCount(4);
    await expect(
      page.locator(`[data-slate-synced-root="${SHARED_ROOT}"]`)
    ).toHaveCount(3);

    const firstEditor = getSyncedEditor(page, 0);
    const duplicatedEditor = getSyncedEditor(page, 1);
    const first = createSlateBrowserEditorHarness(
      page,
      'synced-blocks-first-copy',
      firstEditor
    );

    await first.selection.collapse({ path: [0, 0], offset: 0 });
    await first.insertText('Shared ');
    await expect(duplicatedEditor).toContainText(
      'Shared Shared mission statement'
    );

    await page
      .getByRole('button', { name: 'Unsync synced block' })
      .nth(1)
      .click();

    await first.selection.collapse({ path: [0, 0], offset: 0 });
    await first.insertText('Live ');

    await expect(firstEditor).toContainText(
      'Live Shared Shared mission statement'
    );
    await expect(duplicatedEditor).toContainText(
      'Shared Shared mission statement'
    );
    await expect(duplicatedEditor).not.toContainText(
      'Live Shared Shared mission statement'
    );
  });
});
