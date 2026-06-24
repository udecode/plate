import { expect, type Locator, test } from '@playwright/test';
import {
  assertNoIllegalKernelTransitions,
  createPliteBrowserDropDataGauntlet,
  createPliteBrowserEditorHarness,
  createPliteBrowserInternalControlGauntlet,
  openExample,
  recordPliteBrowserRuntimeErrors,
  withExclusiveClipboardAccess,
} from '@platejs/browser/playwright';

test.describe('editable voids', () => {
  const input = 'input[type="text"]';
  const elements = [
    { tag: 'h4', count: 3 },
    { tag: input, count: 1 },
    { tag: 'input[type="radio"]', count: 2 },
  ];
  const getCollapsedSelectionRect = async (page: {
    evaluate: <T>(fn: () => T) => Promise<T>;
  }) =>
    page.evaluate(() => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        return null;
      }

      const rect = selection.getRangeAt(0).getBoundingClientRect();

      return {
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        top: rect.top,
      };
    });

  const expectSameVisualColumn = (
    before: Awaited<ReturnType<typeof getCollapsedSelectionRect>>,
    after: Awaited<ReturnType<typeof getCollapsedSelectionRect>>
  ) => {
    expect(before).not.toBe(null);
    expect(after).not.toBe(null);
    expect(Math.abs(after!.left - before!.left)).toBeLessThanOrEqual(24);
  };
  const getViewSelection = (root: Locator) =>
    root.evaluate((element: HTMLElement) => {
      const handle = (
        element as HTMLElement & {
          __pliteBrowserHandle?: {
            getViewSelection?: () => unknown;
          };
        }
      ).__pliteBrowserHandle;

      return handle?.getViewSelection?.() ?? null;
    });
  const setViewSelection = (root: Locator, selection: unknown) =>
    root.evaluate((element: HTMLElement, nextSelection) => {
      const handle = (
        element as HTMLElement & {
          __pliteBrowserHandle?: {
            setViewSelection?: (selection: unknown) => void;
          };
        }
      ).__pliteBrowserHandle;

      if (!handle?.setViewSelection) {
        throw new Error('This editor surface does not expose setViewSelection');
      }

      handle.setViewSelection(nextSelection);
    }, selection);

  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/plite/editable-voids', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator(input)).toHaveCount(1);
  });

  test('checks for the elements', async ({ page }) => {
    for (const elem of elements) {
      const { tag, count } = elem;
      await expect(page.locator(tag)).toHaveCount(count);
    }
  });

  test('should double the elements', async ({ page }) => {
    // click the `+` sign to duplicate the editable void
    await page.getByRole('button', { name: 'Add' }).click();

    for (const elem of elements) {
      const { tag, count } = elem;
      await expect(page.locator(tag)).toHaveCount(count * 2);
    }
  });

  test('make sure you can edit editable void', async ({ page }) => {
    await page.locator(input).fill('Typing');
    await expect(page.locator(input)).toHaveValue('Typing');
  });

  test('undo from a new editable void input removes the inserted void block', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Native input undo proof needs desktop keyboard shortcuts'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page, {
      patterns: ['Could not set focus', 'pending operations'],
    });

    try {
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.locator(input)).toHaveCount(2);

      const insertedInput = page.locator(input).last();

      await insertedInput.fill('abc');
      await expect(insertedInput).toHaveValue('abc');

      await page.keyboard.press('ControlOrMeta+Z');

      await expect(page.locator(input)).toHaveCount(1);
      await page.waitForTimeout(50);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('redo restores an inserted editable void child root after undo', async ({
    page,
  }) => {
    const editors = page.locator('[data-plite-editor="true"]');
    const outerEditor = editors.first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator(input)).toHaveCount(2);
    await expect(editors).toHaveCount(3);

    await outer.undo();
    await expect(page.locator(input)).toHaveCount(1);
    await expect(editors).toHaveCount(2);

    await outer.redo();
    await expect(page.locator(input)).toHaveCount(2);
    await expect(editors).toHaveCount(3);

    const restoredChildEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .last();
    const restoredChild = createPliteBrowserEditorHarness(
      page,
      'editable-voids-restored-child-root',
      restoredChildEditor
    );

    await restoredChild.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await restoredChild.insertText('Restored');
    await expect.poll(() => restoredChild.get.modelText()).toBe('Restored');
  });

  test('keeps native paste inside editable void input', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Native input clipboard proof needs desktop keyboard shortcuts'
    );

    const inputElement = page.locator(input);

    await inputElement.fill('hello');
    await inputElement.evaluate((element: HTMLInputElement) => {
      element.focus();
      element.setSelectionRange(1, 5);
    });

    await withExclusiveClipboardAccess(async () => {
      await page.keyboard.press('ControlOrMeta+C');
      await page.keyboard.press('ControlOrMeta+V');
      await page.keyboard.press('ControlOrMeta+V');
    });

    await expect(inputElement).toHaveValue('helloello');
  });

  test('keeps focused editable void input range selection native-owned', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Native input range-selection proof needs desktop keyboard input'
    );

    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const inputElement = page.locator(input);
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );
    const outerSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    await outer.selection.select(outerSelection);
    await inputElement.fill('Typing');
    await inputElement.evaluate((element: HTMLInputElement) => {
      element.focus();
      element.setSelectionRange(1, 5);
    });

    await expect(inputElement).toBeFocused();
    await expect
      .poll(() =>
        inputElement.evaluate((element: HTMLInputElement) => ({
          selectedText: element.value.slice(
            element.selectionStart ?? 0,
            element.selectionEnd ?? 0
          ),
          selectionEnd: element.selectionEnd,
          selectionStart: element.selectionStart,
        }))
      )
      .toEqual({
        selectedText: 'ypin',
        selectionEnd: 5,
        selectionStart: 1,
      });

    await expect
      .poll(() => outer.selection.displayed())
      .toMatchObject({
        doubleHighlighted: false,
        hasVisibleEditorSelection: false,
        hasVisibleSelection: true,
        source: 'none',
      });
    await expect.poll(() => outer.selection.get()).toEqual(outerSelection);

    await page.keyboard.type('!');
    await expect(inputElement).toHaveValue('T!g');
    await expect.poll(() => outer.selection.get()).toEqual(outerSelection);
  });

  test('restores outer editor selection after editing input inside editable void', async ({
    page,
  }, testInfo) => {
    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const inputElement = page.locator(input);
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );

    await outer.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await inputElement.pressSequentially('Typing', { delay: 20 });
    await expect(inputElement).toHaveValue('Typing');
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

    await outerEditor.evaluate((element: HTMLElement) => {
      element.focus();
    });
    if (testInfo.project.name === 'mobile') {
      await outer.insertText('Outer ');
    } else {
      await page.keyboard.type('Outer ');
    }

    await expect
      .poll(() => outer.get.modelText())
      .toContain('Outer In addition to nodes');
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 'Outer '.length },
        focus: { path: [0, 0], offset: 'Outer '.length },
      });
  });

  test('runs generated internal-control gauntlet without illegal kernel transitions', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'plite/editable-voids', {
      ready: {
        editor: 'visible',
      },
    });

    const result = await editor.scenario.run(
      'editable-voids-generated-internal-control-gauntlet',
      createPliteBrowserInternalControlGauntlet({
        controlSelector: input,
        controlValue: 'Typing',
        followUpText: 'Outer ',
        outerSelection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        textAfterFollowUp: 'Outer In addition to nodes',
      }),
      {
        metadata: {
          capabilities: ['internal-control', 'kernel-trace', 'model-selection'],
          platform: testInfo.project.name,
          transport: 'semantic-handle',
        },
        tracePath: testInfo.outputPath(
          'editable-voids-internal-control-gauntlet.json'
        ),
      }
    );

    assertNoIllegalKernelTransitions(result);
  });

  test('keeps ArrowLeft inside editable void input native-owned', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop editable-void keyboard proof'
    );

    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const inputElement = page.locator(input);
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );

    const outerSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    await outer.selection.select(outerSelection);
    await inputElement.fill('Typing');
    await inputElement.evaluate((element: HTMLInputElement) => {
      element.focus();
      element.setSelectionRange(4, 4);
    });
    await expect(inputElement).toBeFocused();

    const traceBefore = await outer.get.kernelTrace();
    await inputElement.press('ArrowLeft');

    await expect(inputElement).toBeFocused();
    await expect
      .poll(() =>
        inputElement.evaluate((element: HTMLInputElement) => ({
          end: element.selectionEnd,
          start: element.selectionStart,
        }))
      )
      .toEqual({ end: 3, start: 3 });
    await expect.poll(() => outer.selection.get()).toEqual(outerSelection);

    const traceAfter = await outer.get.kernelTrace();
    expect(traceAfter.slice(traceBefore.length)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: null,
          eventFamily: 'keydown',
          intent: 'internal-control',
          selectionPolicy: {
            kind: 'none',
            reason: 'internal-control',
          },
          targetOwner: 'internal-control',
        }),
      ])
    );
    expect(traceAfter.slice(traceBefore.length)).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: expect.objectContaining({
            kind: 'move-selection',
          }),
        }),
      ])
    );
  });

  test('ignores selectionchange noise from input inside editable void', async ({
    page,
  }) => {
    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const inputElement = page.locator(input);
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );

    await outer.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await inputElement.evaluate((element: HTMLInputElement) => {
      element.dispatchEvent(new Event('selectionchange', { bubbles: true }));
    });

    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
  });

  test('edits same-runtime child root inside editable void', async ({
    page,
  }) => {
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );

    await expect(childEditor).toContainText('This is editable');
    await childRoot.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await childRoot.insertText('Child ');

    await expect
      .poll(() => childRoot.get.modelText())
      .toContain('Child This is editable');
    await expect(childEditor).toContainText('Child This is editable');
  });

  test('Backspace in the first child-root block preserves the editable void', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Backspace proof');

    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );

    await childRoot.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 4], offset: 1 },
    });
    await childEditor.evaluate((element: HTMLElement) => element.focus());
    await page.keyboard.press('Backspace');

    await expect(page.locator('.plite-editable-voids-card')).toHaveCount(1);
    await expect
      .poll(() => outer.get.modelText())
      .toContain(
        'In addition to nodes that contain editable text, you can insert void nodes'
      );
    await expect
      .poll(() => childRoot.get.modelText())
      .not.toContain(
        'This is editable rich text, much better than a <textarea>!'
      );
    await expect
      .poll(() => childRoot.get.modelText())
      .toContain(
        "Since it's rich text, it can live in a same-runtime child root"
      );
    await expect
      .poll(() => childRoot.get.modelText())
      .toContain('A wise quote.');
  });

  test('keeps same-runtime child root focused inside editable void', async ({
    page,
  }, testInfo) => {
    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );

    await expect(childEditor).toContainText('This is editable');
    await childRoot.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await childEditor.evaluate((element: HTMLElement) => {
      element.focus();
    });
    if (testInfo.project.name === 'mobile') {
      await childRoot.insertText('Child ');
    } else {
      await page.keyboard.type('Child ');
    }

    await expect
      .poll(() => childRoot.get.modelText())
      .toContain('Child This is editable');
    await expect.poll(() => outer.get.modelText()).not.toContain('Child');
    await expect
      .poll(() => childRoot.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 'Child '.length },
        focus: { path: [0, 0], offset: 'Child '.length },
      });
    if (testInfo.project.name !== 'mobile') {
      await expect
        .poll(() => childRoot.selection.dom())
        .toEqual({
          anchorNodeText: 'Child This is editable ',
          anchorOffset: 'Child '.length,
          focusNodeText: 'Child This is editable ',
          focusOffset: 'Child '.length,
        });
    }
  });

  test('keeps same-runtime child-root caret usable after real mouse clicks', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop child-root mouse caret proof uses native click and key events'
    );

    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );

    await expect(childEditor).toContainText('This is editable');

    await childRoot.scenario.run(
      'editable-voids-child-root-mouse-caret-gauntlet',
      [
        {
          kind: 'clickTextOffset',
          path: [0, 0],
          offset: 'This is editable'.length,
        },
        {
          kind: 'assertSelection',
          selection: {
            anchor: { path: [0, 0], offset: 'This is editable'.length },
            focus: { path: [0, 0], offset: 'This is editable'.length },
          },
        },
        {
          kind: 'clickTextOffset',
          path: [0, 0],
          offset: 0,
        },
        {
          kind: 'assertSelection',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 },
          },
        },
        {
          kind: 'clickTextOffset',
          path: [0, 1],
          offset: 'rich'.length,
        },
        {
          kind: 'assertSelection',
          selection: {
            anchor: {
              path: [0, 1],
              offset: 'rich'.length,
            },
            focus: {
              path: [0, 1],
              offset: 'rich'.length,
            },
          },
        },
        {
          kind: 'custom',
          label: 'type through native keyboard',
          run: async () => {
            await page.keyboard.type('X');
          },
        },
        {
          kind: 'assertModelText',
          text: 'This is editable richX text',
        },
        {
          kind: 'assertSelection',
          selection: {
            anchor: {
              path: [0, 1],
              offset: 'richX'.length,
            },
            focus: {
              path: [0, 1],
              offset: 'richX'.length,
            },
          },
        },
      ],
      {
        metadata: {
          capabilities: ['child-root', 'mouse-selection', 'native-input'],
          platform: testInfo.project.name,
          transport: 'native-browser',
        },
        tracePath: testInfo.outputPath(
          'editable-voids-child-root-mouse-caret-gauntlet.json'
        ),
      }
    );
  });

  test('keeps same-runtime child-root arrow navigation usable after clicks', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop child-root arrow navigation proof uses native click and key events'
    );

    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );

    await expect(childEditor).toContainText('This is editable');

    await childRoot.scenario.run(
      'editable-voids-child-root-click-keyboard-navigation-gauntlet',
      [
        {
          kind: 'clickTextOffset',
          path: [0, 0],
          offset: 0,
        },
        {
          kind: 'press',
          key: 'ArrowRight',
        },
        {
          kind: 'assertSelection',
          selection: {
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 1 },
          },
        },
        {
          kind: 'press',
          key: 'ArrowRight',
        },
        {
          kind: 'assertSelection',
          selection: {
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 2 },
          },
        },
        {
          kind: 'clickTextOffset',
          path: [0, 1],
          offset: 2,
        },
        {
          kind: 'press',
          key: 'ArrowLeft',
        },
        {
          kind: 'assertSelection',
          selection: {
            anchor: { path: [0, 1], offset: 1 },
            focus: { path: [0, 1], offset: 1 },
          },
        },
        {
          kind: 'clickTextOffset',
          path: [1, 0],
          offset: 0,
        },
        {
          kind: 'press',
          key: 'ArrowRight',
        },
        {
          kind: 'assertSelection',
          selection: {
            anchor: { path: [1, 0], offset: 1 },
            focus: { path: [1, 0], offset: 1 },
          },
        },
      ],
      {
        metadata: {
          capabilities: [
            'child-root',
            'keyboard-navigation',
            'mouse-selection',
          ],
          platform: testInfo.project.name,
          transport: 'native-browser',
        },
        tracePath: testInfo.outputPath(
          'editable-voids-child-root-click-keyboard-navigation-gauntlet.json'
        ),
      }
    );
  });

  test('moves across editable void child-root boundaries with keyboard', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Keyboard boundary proof uses desktop arrow behavior'
    );

    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );
    const beforeVoidText =
      'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or rich same-runtime child roots.';

    await expect(childEditor).toContainText('This is editable');

    await outer.selection.collapse({
      path: [0, 0],
      offset: beforeVoidText.length,
    });
    await outer.press('ArrowRight');
    await expect
      .poll(() => childRoot.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    await expect
      .poll(() => childRoot.selection.dom())
      .toMatchObject({
        anchorNodeText: 'This is editable ',
        anchorOffset: 0,
        focusNodeText: 'This is editable ',
        focusOffset: 0,
      });

    await childRoot.press('ArrowLeft');
    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: beforeVoidText.length },
        focus: { path: [0, 0], offset: beforeVoidText.length },
      });

    await childRoot.selection.collapse({
      path: [2, 0],
      offset: 'A wise quote.'.length,
    });
    await childRoot.press('ArrowRight');
    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      });
  });

  test('moves vertically across editable void child-root boundaries with keyboard', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop vertical content-root proof'
    );

    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );
    // Native vertical navigation preserves the x-column, which lands mid-word.
    const beforeVoidText =
      'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or rich same-runtime child roots.';
    const belowOuterExitOffset = 'The editable void '.length;

    await expect(childEditor).toContainText('This is editable');

    await outer.selection.collapse({
      path: [0, 0],
      offset: beforeVoidText.length,
    });
    await outerEditor.evaluate((element: HTMLElement) => {
      element.focus();
    });
    const beforeEntryRect = await getCollapsedSelectionRect(page);

    await outer.press('ArrowDown');
    await expect(childEditor).toBeFocused();
    await expect.poll(() => childRoot.selection.get()).not.toBe(null);
    expectSameVisualColumn(
      beforeEntryRect,
      await getCollapsedSelectionRect(page)
    );

    await childRoot.selection.collapse({ path: [0, 0], offset: 0 });
    await childEditor.evaluate((element: HTMLElement) => {
      element.focus();
    });
    const beforeExitAboveRect = await getCollapsedSelectionRect(page);

    await childRoot.press('ArrowUp');
    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toMatchObject({
        anchor: { path: [0, 0] },
        focus: { path: [0, 0] },
      });
    const aboveOuterSelection = await outer.selection.get();
    expect(aboveOuterSelection?.anchor.offset).toBeGreaterThan(0);
    expect(aboveOuterSelection?.anchor.offset).toBeLessThanOrEqual(
      beforeVoidText.length
    );
    expect(aboveOuterSelection?.focus.offset).toBe(
      aboveOuterSelection?.anchor.offset
    );
    expectSameVisualColumn(
      beforeExitAboveRect,
      await getCollapsedSelectionRect(page)
    );

    await childRoot.selection.collapse({
      path: [2, 0],
      offset: 'A wise quote.'.length,
    });
    await childEditor.evaluate((element: HTMLElement) => {
      element.focus();
    });
    const beforeExitBelowRect = await getCollapsedSelectionRect(page);

    await childRoot.press('ArrowDown');
    await expect(outerEditor).toBeFocused();
    await expect
      .poll(() => outer.selection.get())
      .toMatchObject({
        anchor: { path: [2, 0], offset: belowOuterExitOffset },
        focus: { path: [2, 0], offset: belowOuterExitOffset },
      });
    expectSameVisualColumn(
      beforeExitBelowRect,
      await getCollapsedSelectionRect(page)
    );
  });

  test('extends keyboard selection from editable void child root into outer siblings', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop projected selection proof'
    );

    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );
    const beforeVoidText =
      'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or rich same-runtime child roots.';
    const childRootOwner = {
      childRoot: 'editable-void:initial:body',
      ownerPath: [1],
      ownerRoot: 'main',
    };

    await outer.selection.collapse({ path: [2, 0], offset: 0 });
    await outer.insertText('After editable void.');

    await childRoot.selection.collapse({ path: [0, 0], offset: 0 });
    await childEditor.evaluate((element: HTMLElement) => {
      element.focus();
    });
    await page.keyboard.press('Shift+ArrowLeft');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: childRootOwner,
          point: {
            path: [0, 0],
            root: 'editable-void:initial:body',
            offset: 0,
          },
        },
        focus: { point: { path: [0, 0], offset: beforeVoidText.length - 1 } },
        segments: { backward: true },
      });

    await setViewSelection(outerEditor, null);
    await childRoot.selection.collapse({ path: [0, 0], offset: 0 });
    await childEditor.evaluate((element: HTMLElement) => {
      element.focus();
    });
    await page.keyboard.press('Shift+ArrowUp');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: childRootOwner,
          point: {
            path: [0, 0],
            root: 'editable-void:initial:body',
            offset: 0,
          },
        },
        focus: { point: { path: [0, 0] } },
        segments: { backward: true },
      });

    await setViewSelection(outerEditor, null);
    await childRoot.selection.collapse({
      path: [2, 0],
      offset: 'A wise quote.'.length,
    });
    await childEditor.evaluate((element: HTMLElement) => {
      element.focus();
    });
    await page.keyboard.press('Shift+ArrowRight');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: childRootOwner,
          point: {
            path: [2, 0],
            root: 'editable-void:initial:body',
            offset: 'A wise quote.'.length,
          },
        },
        focus: { point: { path: [2, 0], offset: 1 } },
        segments: { backward: false },
      });

    await setViewSelection(outerEditor, null);
    await childRoot.selection.collapse({
      path: [2, 0],
      offset: 'A wise quote.'.length,
    });
    await childEditor.evaluate((element: HTMLElement) => {
      element.focus();
    });
    await page.keyboard.press('Shift+ArrowDown');
    await expect
      .poll(() => getViewSelection(outerEditor))
      .toMatchObject({
        anchor: {
          owner: childRootOwner,
          point: {
            path: [2, 0],
            root: 'editable-void:initial:body',
            offset: 'A wise quote.'.length,
          },
        },
        focus: { point: { path: [2, 0] } },
        segments: { backward: false },
      });
  });

  test('unfocuses editable void child root when clicking outside it', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop child-root unfocus proof uses real mouse clicks'
    );

    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );

    await expect(childEditor).toContainText('This is editable');

    await childRoot.scenario.run(
      'editable-voids-child-root-click-outside-unfocus-gauntlet',
      [
        {
          kind: 'clickTextOffset',
          path: [0, 1],
          offset: 'rich'.length,
        },
        {
          kind: 'assertSelection',
          selection: {
            anchor: { path: [0, 1], offset: 'rich'.length },
            focus: { path: [0, 1], offset: 'rich'.length },
          },
        },
      ],
      {
        metadata: {
          capabilities: ['child-root', 'mouse-selection', 'unfocus'],
          platform: testInfo.project.name,
          transport: 'native-browser',
        },
        tracePath: testInfo.outputPath(
          'editable-voids-child-root-click-outside-unfocus-gauntlet.json'
        ),
      }
    );
    await outer.scenario.run(
      'editable-voids-outer-click-after-focused-child-root-gauntlet',
      [
        {
          kind: 'clickTextOffset',
          path: [0, 0],
          offset: 0,
        },
      ],
      {
        metadata: {
          capabilities: ['child-root', 'mouse-selection', 'unfocus'],
          platform: testInfo.project.name,
          transport: 'native-browser',
        },
        tracePath: testInfo.outputPath(
          'editable-voids-outer-click-after-focused-child-root-gauntlet.json'
        ),
      }
    );

    await expect(outerEditor).toBeFocused();
    await expect.poll(() => childRoot.selection.get()).toBe(null);
    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
  });

  test('pastes text inside same-runtime child root without stealing outer selection', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Rich HTML clipboard proof needs desktop keyboard shortcuts'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );
    const outerSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    try {
      await outer.selection.select(outerSelection);
      await childRoot.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 4], offset: '!'.length },
      });
      await childRoot.clipboard.pasteText('Hello World');

      runtimeErrors.assertNone();
      await expect
        .poll(async () =>
          (await childRoot.get.modelText()).replaceAll('\u00a0', ' ')
        )
        .toContain('Hello World');
      await expect
        .poll(() => outer.get.modelText())
        .not.toContain('Hello World');

      await outer.focus();
      await outer.selection.select(outerSelection);
      await page.keyboard.type('Outer ');

      runtimeErrors.assertNone();
      await expect
        .poll(() => outer.get.modelText())
        .toContain('Outer In addition to nodes');
    } finally {
      runtimeErrors.stop();
    }
  });

  test('copies and cuts same-runtime child-root selection without editing outer text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop child-root copy/cut proof needs clipboard events'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );
    const outerSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const childSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 1], offset: 'rich'.length },
    };

    try {
      await outer.selection.select(outerSelection);
      await childRoot.selection.select(childSelection);
      await childEditor.evaluate((element: HTMLElement) => element.focus());

      const copyPayload = await childRoot.clipboard.copyEventPayload();

      expect(copyPayload.text).toBe('This is editable rich');
      expect(copyPayload.pliteFragment).toBeTruthy();
      expect(copyPayload.types).toEqual(
        expect.arrayContaining([
          'application/x-plite-fragment',
          'text/html',
          'text/plain',
        ])
      );
      await expect
        .poll(() => childRoot.get.modelText())
        .toContain('This is editable rich text');

      const cutPayload = await childRoot.clipboard.cutEventPayload();

      expect(cutPayload.text).toBe('This is editable rich');
      expect(cutPayload.pliteFragment).toBeTruthy();
      await expect
        .poll(() => childRoot.get.modelText())
        .toContain(' text, much better than a <textarea>!');
      await expect
        .poll(() => childRoot.get.modelText())
        .not.toContain('This is editable rich');

      await outer.focus();
      await outer.selection.select(outerSelection);
      await page.keyboard.type('Outer ');

      await expect
        .poll(() => outer.get.modelText())
        .toContain('Outer In addition to nodes');
      await expect
        .poll(() => childRoot.get.modelText())
        .not.toContain('Outer ');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('drops HTML payload inside same-runtime child root without stealing outer selection', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop child-root drop proof'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );
    const childRoot = createPliteBrowserEditorHarness(
      page,
      'editable-voids-child-root',
      childEditor
    );
    const outerSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    try {
      await outer.selection.select(outerSelection);
      await childRoot.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      const textAfterDrop =
        "Dropped WorldThis is editable rich text, much better than a <textarea>!Since it's rich text, it can live in a same-runtime child root instead of a nested independent editor.A wise quote.";

      const result = await childRoot.scenario.run(
        'editable-voids-child-root-drop-data-gauntlet',
        createPliteBrowserDropDataGauntlet({
          html: '<p>Dropped <strong>World</strong></p>',
          plainText: 'Dropped World',
          textAfterDrop,
        }),
        {
          metadata: {
            capabilities: ['child-root', 'drop', 'html-drop', 'kernel-trace'],
            platform: testInfo.project.name,
            transport: 'synthetic-datatransfer-drop',
          },
          tracePath: testInfo.outputPath(
            'editable-voids-child-root-drop-data-gauntlet.json'
          ),
        }
      );

      assertNoIllegalKernelTransitions(result);
      expect(result.metadata.claim).toBe('synthetic-datatransfer');
      await expect
        .poll(() => outer.get.modelText())
        .not.toContain('Dropped World');

      await outer.focus();
      await outer.selection.select(outerSelection);
      await page.keyboard.type('Outer ');

      runtimeErrors.assertNone();
      await expect
        .poll(() => outer.get.modelText())
        .toContain('Outer In addition to nodes');
    } finally {
      runtimeErrors.stop();
    }
  });

  test('ignores a parent selection that crosses into a same-runtime child root', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop cross-editor DOM selection proof'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const outerEditor = page.locator('[data-plite-editor="true"]').first();
    const childEditor = page
      .locator('[aria-label="Editable void rich content"]')
      .first();
    const outer = createPliteBrowserEditorHarness(
      page,
      'editable-voids-outer',
      outerEditor
    );

    try {
      await outer.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      await outerEditor.focus();

      await outerEditor.evaluate((outerElement: HTMLElement) => {
        const childRootElement = outerElement.ownerDocument.querySelector(
          '[aria-label="Editable void rich content"]'
        );
        const outerText = outerElement.querySelector(
          '[data-plite-string]'
        )?.firstChild;
        const childRootText = childRootElement?.querySelector(
          '[data-plite-string]'
        )?.firstChild;

        if (!outerText || !childRootText) {
          throw new Error('Cannot create outer-to-child-root selection');
        }

        const range = outerElement.ownerDocument.createRange();
        range.setStart(outerText, 0);
        range.setEnd(childRootText, 4);

        const selection = outerElement.ownerDocument.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        outerElement.ownerDocument.dispatchEvent(
          new Event('selectionchange', { bubbles: true })
        );
      });
      await page.waitForTimeout(150);
      await page.keyboard.type('Outer ');

      runtimeErrors.assertNone();
      await expect
        .poll(() => outer.get.modelText())
        .toMatch(/^Outer In addition to nodes/);
      await expect(childEditor).toContainText('This is editable');
    } finally {
      runtimeErrors.stop();
    }
  });
});
