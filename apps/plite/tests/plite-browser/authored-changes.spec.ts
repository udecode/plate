import { openExample, recordPliteBrowserRuntimeErrors } from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

const openReview = async (page: Page) => {
  const { errors } = recordPliteBrowserRuntimeErrors(page, { strict: true });
  const proposed = await openExample(page, 'plite/authored-changes', {
    ready: { editor: 'visible' },
    surface: { scope: '#authored-proposed-surface' },
  });
  return {
    accepted: proposed.rootAt('[aria-label="Accepted document"]'),
    controls: page.locator('[aria-label="Proposed document controls"]'),
    errors,
    independent: proposed.rootAt('[aria-label="Independent document"]'),
    proposed,
  };
};

test.describe('native authored changes', () => {
  for (const modifier of ['held', 'released'] as const) {
  test(`preserves the vertical column across short wrapped lines with Shift ${modifier}`, async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.root.evaluate((root) => {
      Object.assign((root as HTMLElement).style, {
        width: '12ch',
        maxWidth: 'none',
        boxSizing: 'content-box',
        padding: '0',
        border: '0',
        fontFamily: 'monospace',
        fontSize: '20px',
        lineHeight: '30px',
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap',
      });
    });
    const focus = () =>
      proposed.root.evaluate((root) => {
        const handle = (
          root as HTMLElement & {
            __pliteBrowserHandle?: {
              getSelection: () => { focus: { path: number[]; offset: number } };
              getViewSelection: () => {
                focus: {
                  fragmentId?: string;
                  point: { path: number[]; offset: number };
                };
              } | null;
            };
          }
        ).__pliteBrowserHandle;
        if (!handle) throw new Error('Missing selection handle');
        const projected = handle.getViewSelection()?.focus;
        return {
          fragmentId: projected?.fragmentId ?? null,
          point: projected?.point ?? handle.getSelection().focus,
        };
      });
    await proposed.selection.collapse({ path: [1, 0], offset: 5 });
    const start = await focus();
    const move = (key: 'ArrowDown' | 'ArrowUp') =>
      page.keyboard.press(modifier === 'held' ? key : `Shift+${key}`);
    if (modifier === 'held') await page.keyboard.down('Shift');
    await move('ArrowUp');
    const middle = await focus();
    await move('ArrowUp');
    await expect
      .poll(() =>
        proposed.root.locator('[data-plite-view-selection]').allTextContents()
          .then((parts) => parts.join(''))
      )
      .toBe('red draft.Selec');
    await proposed.assert.noDoubleSelectionHighlight();
    await move('ArrowDown');
    await expect.poll(focus).toEqual(middle);
    await move('ArrowDown');
    await expect.poll(focus).toEqual(start);
    if (modifier === 'held') await page.keyboard.up('Shift');
    await proposed.selection.collapse({ path: [1, 0], offset: 5 });
    await proposed.root.evaluate((root) => {
      const traceRoot = root as HTMLElement & {
        __verticalTrace?: unknown[];
        __pliteBrowserHandle?: {
          getSelection: () => unknown;
          getViewSelection: () => unknown;
        };
      };
      traceRoot.__verticalTrace = [];
      for (const type of ['keydown', 'keyup', 'selectionchange']) {
        document.addEventListener(type, (event) => {
          const selection = window.getSelection();
          traceRoot.__verticalTrace?.push({
            type: event.type,
            key: event instanceof KeyboardEvent ? event.key : null,
            model: traceRoot.__pliteBrowserHandle?.getSelection(),
            view: traceRoot.__pliteBrowserHandle?.getViewSelection(),
            native: {
              text: selection?.focusNode?.textContent,
              offset: selection?.focusOffset,
            },
          });
        });
      }
    });
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await test.info().attach('vertical-transitions.json', {
      body: JSON.stringify(await proposed.root.evaluate((root) =>
        (root as HTMLElement & { __verticalTrace?: unknown[] }).__verticalTrace
      ), null, 2),
      contentType: 'application/json',
    });
    await expect.poll(focus).toMatchObject({
      point: { path: [0, 0], offset: 3 },
    });
    expect((await focus()).fragmentId).not.toBeNull();
    await page.screenshot({ path: test.info().outputPath('wrapped-retained-caret.png') });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect.poll(focus).toEqual(start);
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('Selec!t a phrase');
    await expect(accepted.root).toContainText('Select a phrase');
    expect(errors).toEqual([]);
  });
  }

  test('moves vertically into retained text and reverses the native selection path', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.root.evaluate((root) => {
      Object.assign((root as HTMLElement).style, {
        width: '900px',
        maxWidth: 'none',
        fontFamily: 'monospace',
        fontSize: '20px',
        lineHeight: '30px',
      });
    });
    await proposed.selection.collapse({ path: [1, 0], offset: 5 });
    await page.keyboard.press('Shift+ArrowUp');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('red draft.\nSelec');
    await proposed.assert.noDoubleSelectionHighlight();
    await page.keyboard.press('Shift+ArrowDown');
    await expect(
      proposed.root.locator('[data-plite-view-selection]')
    ).toHaveCount(0);
    await proposed.selection.collapse({ path: [1, 0], offset: 5 });
    await page.keyboard.press('ArrowUp');
    await expect
      .poll(() =>
        page.evaluate(() => {
          const selection = window.getSelection();
          return {
            text: selection?.focusNode?.textContent,
            offset: selection?.focusOffset,
            retained: !!selection?.focusNode?.parentElement?.closest(
              '[data-plite-retained]'
            ),
          };
        })
      )
      .toEqual({ text: 'shared', offset: 3, retained: true });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('Selec!t a phrase');
    await expect(accepted.root).toContainText('Select a phrase');
    expect(errors).toEqual([]);
  });

  test('extends to visual line edges across retained content with Home and End', async ({
    page,
  }) => {
    const { controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    await page.keyboard.press('Shift+End');
    expect((await proposed.clipboard.copyNativeEventPayload()).text).toBe(
      ' shared draft.'
    );
    await page.keyboard.press('Home');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('!A shared draft.');
    expect(errors).toEqual([]);
  });

  test('selects all visible markup and protects retained text during replacement', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    await page.keyboard.press(
      `${process.platform === 'darwin' ? 'Meta' : 'Control'}+a`
    );
    await expect(
      proposed.root.locator('[data-plite-retained] [data-plite-view-selection]')
    ).toHaveText('shared');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe(
      'A shared draft.\nSelect a phrase, type a replacement, and review the result.'
    );
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('A shared draft.');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    expect(errors).toEqual([]);
  });

  for (const side of ['before', 'after'] as const) {
    test(`collapses ${side} retained text and preserves native typing through review and history`, async ({
      page,
    }) => {
      const { accepted, controls, errors, proposed } = await openReview(page);
      await proposed.selection.collapse({ path: [0, 0], offset: 2 });
      for (let index = 0; index < 6; index++) {
        await page.keyboard.press('Shift+ArrowRight');
      }
      await page.keyboard.press('Backspace');
      await controls
        .getByRole('button', { name: 'Show changes', exact: true })
        .click();
      await page.getByRole('combobox', { name: 'Author' }).selectOption('bob');
      await proposed.selection.collapse({ path: [0, 0], offset: 2 });
      for (let index = 0; index < 6; index++) {
        await page.keyboard.press('Shift+ArrowRight');
      }
      await page.keyboard.press(side === 'after' ? 'ArrowRight' : 'ArrowLeft');
      await expect
        .poll(() =>
          page.evaluate(() => {
            const selection = window.getSelection();
            return {
              text: selection?.focusNode?.textContent,
              offset: selection?.focusOffset,
              collapsed: selection?.isCollapsed,
              retained: !!selection?.focusNode?.parentElement?.closest(
                '[data-plite-retained]'
              ),
            };
          })
        )
        .toEqual({
          text: side === 'after' ? ' draft.' : 'A ',
          offset: side === 'after' ? 0 : 2,
          collapsed: true,
          retained: false,
        });
      const expected =
        side === 'after' ? 'A shared!? draft.' : 'A !?shared draft.';
      await page.keyboard.type('!?');
      await expect(proposed.root).toContainText(expected);
      await expect(accepted.root).toContainText('A shared draft.');
      await controls.getByRole('button', { name: 'Undo', exact: true }).click();
      await expect(proposed.root).toContainText('A shared draft.');
      await controls.getByRole('button', { name: 'Redo', exact: true }).click();
      await expect(proposed.root).toContainText(expected);
      await page
        .getByRole('button', { name: 'Reject all Alice', exact: true })
        .click();
      await expect(proposed.root).toContainText(expected);
      await expect(proposed.root.locator('[data-plite-retained]')).toHaveCount(
        0
      );
      await page
        .getByRole('button', { name: 'Accept all Bob', exact: true })
        .click();
      await expect(accepted.root).toContainText(expected);
      expect(errors).toEqual([]);
    });
  }

  test('maps native retained selection through another view edit and restores the deletion', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await accepted.root.evaluate((root) => {
      const handle = (
        root as HTMLElement & {
          __pliteBrowserHandle?: {
            insertTextAt: (
              text: string,
              at: { path: number[]; offset: number }
            ) => void;
          };
        }
      ).__pliteBrowserHandle;
      if (!handle) throw new Error('Missing accepted-view edit handle');
      handle.insertTextAt('P ', { path: [0, 0], offset: 0 });
      handle.insertTextAt('X', { path: [0, 0], offset: 7 });
    });
    const selectedText = () =>
      proposed.root
        .locator('[data-plite-view-selection]')
        .allTextContents()
        .then((parts) => parts.join(''));
    await expect.poll(selectedText).toBe('shaXred');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('shaXred');
    await page.keyboard.press('Shift+ArrowRight');
    await expect.poll(selectedText).toBe('shaXred ');
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await expect(proposed.root.locator('[data-plite-retained]')).toHaveCount(0);
    await expect(
      proposed.root.locator('[data-plite-view-selection]')
    ).toHaveCount(0);
    await expect(proposed.root).toContainText('P A shaXred draft.');
    await expect(accepted.root).toContainText('P A shaXred draft.');
    expect(errors).toEqual([]);
  });

  test('uses native word shortcuts across retained text', async ({ page }) => {
    const { controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    const modifier = process.platform === 'darwin' ? 'Alt' : 'Control';
    const selectedText = () =>
      proposed.root
        .locator('[data-plite-view-selection]')
        .allTextContents()
        .then((parts) => parts.join(''));
    await page.keyboard.press(`${modifier}+Shift+ArrowRight`);
    await expect.poll(selectedText).toBe(' shared');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe(' shared');
    await page.keyboard.press(`${modifier}+Shift+ArrowRight`);
    await expect.poll(selectedText).toBe(' shared draft');
    await page.keyboard.press(`${modifier}+Shift+ArrowLeft`);
    await expect.poll(selectedText).toBe(' shared ');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('A shared draft.');
    expect(errors).toEqual([]);
  });

  test('advances retained selection in both directions after each native input settles', async ({
    page,
  }) => {
    const { controls, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    const selectedText = () =>
      proposed.root
        .locator('[data-plite-view-selection]')
        .allTextContents()
        .then((parts) => parts.join(''));
    for (const selected of [
      ' ',
      ' s',
      ' sh',
      ' sha',
      ' shar',
      ' share',
      ' shared',
      ' shared ',
    ]) {
      await page.keyboard.press('Shift+ArrowRight');
      await expect.poll(selectedText).toBe(selected);
    }
    for (const selected of [
      ' shared',
      ' share',
      ' shar',
      ' sha',
      ' sh',
      ' s',
      ' ',
      '',
    ]) {
      await page.keyboard.press('Shift+ArrowLeft');
      await expect.poll(selectedText).toBe(selected);
    }
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('A !shared draft.');
  });

  test('selects retained text through native arrows, copies it and refuses ordinary input', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A  draft.');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await expect(proposed.root.locator('[data-plite-retained]')).toHaveText(
      'shared'
    );
    await expect(proposed.root).toContainText('A shared draft.');
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    if (process.env.PLITE_AUTHORED_SELECTION_TRACE) {
      await proposed.root.evaluate((root) => {
        const entries: unknown[] = [];
        const traceRoot = root as HTMLElement & {
          __authoredSelectionTrace?: unknown[];
          __pliteBrowserHandle?: {
            getSelection?: () => unknown;
            getViewSelection?: () => unknown;
          };
        };
        traceRoot.__authoredSelectionTrace = entries;
        const capture = (event: Event, phase: string) => {
          const selection = window.getSelection();
          const view = traceRoot.__pliteBrowserHandle?.getViewSelection?.();
          entries.push({
            phase,
            event: event.type,
            key: event instanceof KeyboardEvent ? event.key : null,
            prevented: event.defaultPrevented,
            native: {
              anchor: selection?.anchorOffset,
              anchorText: selection?.anchorNode?.textContent,
              focus: selection?.focusOffset,
              focusText: selection?.focusNode?.textContent,
              text: selection?.toString(),
            },
            model: traceRoot.__pliteBrowserHandle?.getSelection?.(),
            view,
            active: document.activeElement?.getAttribute('aria-label'),
          });
        };
        for (const type of ['keydown', 'keyup', 'selectionchange']) {
          document.addEventListener(
            type,
            (event) => capture(event, 'capture'),
            true
          );
          document.addEventListener(type, (event) => capture(event, 'bubble'));
        }
      });
    }
    for (let index = 0; index < 8; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    if (process.env.PLITE_AUTHORED_SELECTION_TRACE) {
      const trace = await proposed.root.evaluate(
        (root) =>
          (root as HTMLElement & { __authoredSelectionTrace?: unknown[] })
            .__authoredSelectionTrace
      );
      await test.info().attach('selection-events.json', {
        body: JSON.stringify(trace, null, 2),
        contentType: 'application/json',
      });
    }
    await expect(
      proposed.root.locator('[data-plite-retained] [data-plite-view-selection]')
    ).toHaveText('shared');
    await expect(
      accepted.root.locator('[data-plite-view-selection]')
    ).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('');
    await proposed.assert.noDoubleSelectionHighlight();
    await page.screenshot({
      path: test.info().outputPath('markup-selection.png'),
    });
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe(' shared ');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(
      proposed.root.locator('[data-plite-retained] [data-plite-view-selection]')
    ).toHaveText('shared');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(
      proposed.root.locator('[data-plite-retained] [data-plite-view-selection]')
    ).toHaveText('shared');
    await proposed.clipboard.pasteNativeText('replacement');
    await expect(proposed.root).toContainText('A shared draft.');
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await expect(proposed.root).toContainText('A  draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    expect(errors).toEqual([]);
  });
  test('copies and cuts proposed text and pastes through native clipboard events', async ({
    page,
  }) => {
    const { accepted, errors, independent, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.type('better ');
    for (let index = 0; index < 7; index++) {
      await page.keyboard.press('Shift+ArrowLeft');
    }
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('better ');
    const cut = await proposed.clipboard.cutNativeEventPayload();
    expect(cut.text).toBe('better ');
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await independent.selection.collapse({ path: [0, 0], offset: 19 });
    await independent.clipboard.pasteNativeText(copied.text);
    await expect(independent.root).toHaveText('A separate documentbetter .');
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await proposed.clipboard.pasteNativeText('fresh ');
    await expect(proposed.root).toContainText('A fresh shared draft.');
    await expect(accepted.root).not.toContainText('fresh');
    expect(errors).toEqual([]);
  });

  test('deletes complete graphemes in proposed content and keeps accepted text intact', async ({
    page,
  }) => {
    const { accepted, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.type('👩🏽‍💻e\u0301🙂');
    await expect(proposed.root).toContainText('A 👩🏽‍💻e\u0301🙂shared draft.');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A 👩🏽‍💻e\u0301shared draft.');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A 👩🏽‍💻shared draft.');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A shared draft.');
    await page.keyboard.type('ready ');
    await expect(proposed.root).toContainText('A ready shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await expect(accepted.root).not.toContainText('ready');
    expect(errors).toEqual([]);
  });

  test('replaces a selected phrase and restores the original range on undo', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('shared');
    await page.keyboard.type('better');
    await expect(proposed.root).toContainText('A better draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await controls.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(proposed.root).toContainText('A shared draft.');
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('shared');
    await controls.getByRole('button', { name: 'Redo', exact: true }).click();
    await expect(proposed.root).toContainText('A better draft.');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('A better! draft.');
    expect(errors).toEqual([]);
  });

  test('types in one proposal view and reviews authors without changing another document', async ({
    page,
  }) => {
    const { accepted, errors, independent, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.type('better ');
    await expect(proposed.root).toContainText('A better shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await expect(accepted.root).not.toContainText('better');

    await page.getByRole('combobox', { name: 'Author' }).selectOption('bob');
    await proposed.selection.collapse({ path: [0, 0], offset: 9 });
    await page.keyboard.type('bold ');
    await expect(proposed.root).toContainText('A better bold shared draft.');
    await page
      .getByRole('button', { name: 'Accept all Alice', exact: true })
      .click();
    await expect(accepted.root).toContainText('A better shared draft.');
    await expect(proposed.root).toContainText('A better bold shared draft.');
    await page
      .getByRole('button', { name: 'Reject all Bob', exact: true })
      .click();
    await expect(proposed.root).toContainText('A better shared draft.');
    await expect(proposed.root).not.toContainText('bold');
    await expect(
      page.getByText('No pending proposals.', { exact: true })
    ).toBeVisible();
    await expect(independent.root).toHaveText('A separate document.');
    expect(errors).toEqual([]);
  });

  test('switches exact-view mode and restores its proposed caret for follow-up typing', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.type('better ');
    await controls
      .getByRole('button', { name: 'Edit accepted', exact: true })
      .click();
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(proposed.root).not.toContainText('better');
    await expect(proposed.root).toBeFocused();
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await expect(proposed.root).toContainText('A better shared draft.');
    await expect(proposed.root).toBeFocused();
    await page.keyboard.type('bold ');
    await expect(proposed.root).toContainText('A better bold shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await expect(accepted.root).not.toContainText('better');
    expect(errors).toEqual([]);
  });

  test('undoes and redoes one native proposal typing burst with its caret', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.type('better ');
    await controls.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(proposed.root).not.toContainText('better');
    await controls.getByRole('button', { name: 'Redo', exact: true }).click();
    await expect(proposed.root).toContainText('A better shared draft.');
    await page.keyboard.type('bold ');
    await expect(proposed.root).toContainText('A better bold shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await expect(accepted.root).not.toContainText('better');
    expect(errors).toEqual([]);
  });
});
