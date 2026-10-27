import {
  BROWSER_HANDLE_KEY,
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

const EDITOR_ROOT = '.editor-editor[contenteditable="true"]';
const HUGE_CODE_BLOCK_INDEX = 2;
const ROUTE = '/blocks/code-block-codemirror-demo';

test.setTimeout(90_000);

test('code-block: keyboard selection follows focus after Chromium composition', async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== 'chromium', 'Chromium composition protocol');
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  const client = await page.context().newCDPSession(page);
  try {
    await page.goto(ROUTE, { waitUntil: 'commit' });
    const editor = createBrowserEditorHarness(
      page,
      'code-block:selection',
      page.locator(EDITOR_ROOT).first()
    );
    await editor.ready({ editor: 'visible', text: 'Huge Code Block' });
    const input = page.locator('[data-code-block-codemirror-input]');
    const initial = await editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX);
    await editor.selection.select({
      anchor: { path: [HUGE_CODE_BLOCK_INDEX, 0], offset: 0 },
      focus: { path: [HUGE_CODE_BLOCK_INDEX, 0], offset: initial!.length },
    });
    await editor.focus();
    await page.keyboard.insertText('AB');
    await expect(input).toHaveText('AB');
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await client.send('Input.imeSetComposition', {
      text: 'a',
      selectionStart: 1,
      selectionEnd: 1,
    });
    await client.send('Input.insertText', { text: 'あ' });
    await expect(input).toHaveText('AあB');
    await page.getByText('Huge Code Block', { exact: true }).click();
    await input.focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Backspace');
    await expect(input).toHaveText('AB');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe('AB');
    await page.keyboard.type('!');
    await expect(input).toHaveText('A!B');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe('A!B');
    runtimeErrors.assertNone();
  } finally {
    await client.detach();
    runtimeErrors.stop();
  }
});

test('code-block: CodeMirror keeps a 10k-line block bounded and model-owned', async ({
  browserName,
  page,
}, testInfo) => {
  test.skip(browserName !== 'chromium', 'Chromium clipboard permissions');
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(ROUTE, { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(
      page,
      'code-block:codemirror',
      root
    );

    await editor.ready({ editor: 'visible', text: 'Huge Code Block' });

    const inputs = page.locator('[data-code-block-codemirror-input]');
    const hugeBlock = page.locator('.editor-codeBlock').last();
    const hugeHost = hugeBlock.locator('[data-code-block-codemirror]');
    const hugeInput = hugeHost.locator('[data-code-block-codemirror-input]');
    const initialText = await editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX);

    expect(initialText).not.toBeNull();
    expect(initialText?.split('\n')).toHaveLength(10_000);
    expect(initialText).toContain(
      'const result10000 = transform(source[9999]);'
    );
    await expect(inputs).toHaveCount(1);
    await expect(hugeHost).toHaveAttribute('data-language', 'typescript');
    await expect(hugeInput).toHaveAttribute('aria-label', 'Code block');
    await expect(hugeInput).toHaveAttribute('contenteditable', 'true');
    await expect(hugeBlock.locator('[data-editor-node="text"]')).toHaveCount(0);

    const initialDOM = await hugeHost.evaluate((host) => ({
      elements: host.querySelectorAll('*').length,
      highlighted: host.querySelectorAll('[class*="hljs-"]').length,
      lines: host.querySelectorAll('.cm-line').length,
      textLength: host.querySelector('.cm-content')?.textContent?.length ?? 0,
    }));

    expect(initialDOM.elements).toBeLessThan(500);
    expect(initialDOM.highlighted).toBeGreaterThan(0);
    expect(initialDOM.lines).toBeLessThan(100);
    expect(initialDOM.textLength).toBeLessThan(64_000);

    const probe = '__EDITOR_CODEMIRROR__';
    const expectedAfterType = `${initialText}${probe}`;

    await editor.selection.collapse({
      offset: initialText!.length,
      path: [HUGE_CODE_BLOCK_INDEX, 0],
    });
    await editor.focus();
    await expect(hugeInput).toBeFocused();
    await page.keyboard.type(probe);
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(expectedAfterType);

    await page.keyboard.press('ControlOrMeta+z');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(initialText);
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(expectedAfterType);

    await hugeBlock.getByRole('button', { name: 'Copy' }).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(expectedAfterType);

    await hugeInput.focus();
    await page.keyboard.press('ControlOrMeta+f');
    const searchInput = hugeHost.getByRole('textbox', { name: 'Find' });

    await searchInput.fill('result10000');
    await searchInput.press('Enter');
    await expect(hugeInput).toContainText('result10000');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(expectedAfterType);

    await page.emulateMedia({ media: 'print' });
    await expect.poll(() => hugeHost.locator('.cm-line').count()).toBe(10_000);
    const printDOM = await hugeHost.evaluate((host) => {
      const scroller = host.querySelector<HTMLElement>('.cm-scroller');
      const lines = host.querySelectorAll('.cm-line');

      return {
        firstLine: lines.item(0).textContent,
        lastLine: lines.item(lines.length - 1).textContent,
        maxHeight: scroller ? getComputedStyle(scroller).maxHeight : null,
        overflowY: scroller ? getComputedStyle(scroller).overflowY : null,
      };
    });

    expect(printDOM.firstLine).toContain('result00001');
    expect(printDOM.lastLine).toContain('result10000');
    expect(printDOM.maxHeight).toBe('none');
    expect(printDOM.overflowY).toBe('visible');

    await page.emulateMedia({ media: 'screen' });
    await expect
      .poll(() => hugeHost.locator('.cm-line').count())
      .toBeLessThan(100);

    const finalDOM = await hugeHost.evaluate((host) => ({
      elements: host.querySelectorAll('*').length,
      lines: host.querySelectorAll('.cm-line').length,
      nativeTextHosts: host.querySelectorAll('[data-editor-node="text"]')
        .length,
    }));

    expect(finalDOM.elements).toBeLessThan(500);
    expect(finalDOM.lines).toBeLessThan(100);
    expect(finalDOM.nativeTextHosts).toBe(0);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('code-block: CodeMirror preserves code editing, IME, and remote updates', async ({
  browserName,
  page,
}, testInfo) => {
  test.skip(browserName !== 'chromium', 'Chromium clipboard permissions');
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(ROUTE, { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(
      page,
      'code-block:codemirror-editing',
      root
    );

    await editor.ready({ editor: 'visible', text: 'Huge Code Block' });

    const blockIndex = HUGE_CODE_BLOCK_INDEX;
    const block = page.locator('.editor-codeBlock').first();
    const host = block.locator('[data-code-block-codemirror]');
    const input = host.locator('[data-code-block-codemirror-input]');
    const initialText = await editor.get.modelBlockText(blockIndex);
    const line = 'const result00001 = transform(source[0]);';
    const offset = initialText!.indexOf(line) + line.length;
    let expected = `${initialText!.slice(0, offset)}\n${initialText!.slice(
      offset
    )}`;

    await editor.selection.collapse({ path: [blockIndex, 0], offset });
    await editor.focus();
    await expect(input).toBeFocused();
    await page.keyboard.press('Enter');
    await expect
      .poll(() => editor.get.modelBlockText(blockIndex))
      .toBe(expected);

    const pasteOffset = offset + 1;

    await page.evaluate(() => navigator.clipboard.writeText('PASTE'));
    await editor.selection.collapse({
      path: [blockIndex, 0],
      offset: pasteOffset,
    });
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+v');
    expected = `${expected.slice(0, pasteOffset)}PASTE${expected.slice(
      pasteOffset
    )}`;
    await expect
      .poll(() => editor.get.modelBlockText(blockIndex))
      .toBe(expected);

    await editor.selection.select({
      anchor: { path: [blockIndex, 0], offset: pasteOffset },
      focus: { path: [blockIndex, 0], offset: pasteOffset + 5 },
    });
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+x');
    expected = `${expected.slice(0, pasteOffset)}${expected.slice(
      pasteOffset + 5
    )}`;
    await expect
      .poll(() => editor.get.modelBlockText(blockIndex))
      .toBe(expected);
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe('PASTE');

    await page.keyboard.press('Tab');
    expected = `${initialText!.slice(0, offset)}\n  ${initialText!.slice(
      offset
    )}`;
    await expect
      .poll(() => editor.get.modelBlockText(blockIndex))
      .toBe(expected);

    await page.keyboard.press('Shift+Tab');
    expected = `${initialText!.slice(0, offset)}\n${initialText!.slice(
      offset
    )}`;
    await expect
      .poll(() => editor.get.modelBlockText(blockIndex))
      .toBe(expected);

    await editor.ime.compose({
      committedText: 'すし',
      steps: ['す', 'すし'],
      text: 'すし',
      transport: 'synthetic',
    });
    expected = `${initialText!.slice(0, offset)}\nすし${initialText!.slice(
      offset
    )}`;
    await expect
      .poll(() => editor.get.modelBlockText(blockIndex))
      .toBe(expected);

    await root.evaluate((element, key) => {
      (
        element as HTMLElement &
          Record<
            string,
            {
              insertTextAt: (
                text: string,
                point: { offset: number; path: number[] },
                policy: { tags: string[] }
              ) => void;
            }
          >
      )[key].insertTextAt(
        'REMOTE:',
        { offset: 0, path: [2, 0] },
        { tags: ['remote'] }
      );
    }, BROWSER_HANDLE_KEY);
    expected = `REMOTE:${expected}`;
    await expect
      .poll(() => editor.get.modelBlockText(blockIndex))
      .toBe(expected);
    await expect(input).toContainText('REMOTE:');

    const previousText = await editor.get.modelBlockText(1);

    await editor.selection.collapse({ path: [blockIndex, 0], offset: 0 });
    await editor.focus();
    await page.keyboard.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { offset: previousText!.length, path: [1, 0] },
      focus: { offset: previousText!.length, path: [1, 0] },
    });

    await editor.selection.collapse({ path: [blockIndex, 0], offset: 8 });
    await editor.focus();
    await page.keyboard.press('ArrowUp');
    await expect
      .poll(async () => {
        const selection = await editor.get.selection();

        return selection?.anchor.path;
      })
      .toEqual([1, 0]);

    await editor.selection.collapse({
      path: [blockIndex, 0],
      offset: expected.length - 1,
    });
    await editor.focus();
    await page.keyboard.press('ArrowDown');
    await expect
      .poll(async () => {
        const selection = await editor.get.selection();

        return selection?.anchor.path;
      })
      .toEqual([3, 0]);

    await block.getByRole('combobox').click();
    await page.getByRole('option', { exact: true, name: 'Plain Text' }).click();
    await expect(host).toHaveAttribute('data-language', 'plaintext');
    await expect.poll(() => host.locator('[class*="hljs-"]').count()).toBe(0);

    const beforeReadOnly = await editor.get.modelBlockText(blockIndex);

    await page.getByText('Editing', { exact: true }).click();
    await page
      .getByRole('menuitemradio', { exact: true, name: 'Viewing' })
      .click();
    runtimeErrors.assertNone();
    await expect(input).toHaveAttribute('contenteditable', 'false');
    await input.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect
      .poll(() => editor.get.modelBlockText(blockIndex))
      .toBe(beforeReadOnly);

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

const readCaret = (page: Page) =>
  page.evaluate(() => {
    const selection = document.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const rect = range?.getBoundingClientRect();
    const scroller = document
      .querySelector('[data-code-block-codemirror-input]')
      ?.closest('.cm-editor')
      ?.querySelector('.cm-scroller')
      ?.getBoundingClientRect();

    return rect
      ? {
          inScroller:
            !!scroller &&
            rect.top >= scroller.top &&
            rect.bottom <= scroller.bottom,
          x: rect.left,
        }
      : null;
  });

const distanceBeyondNearestCaret = (page: Page, goalX: number) =>
  page.evaluate((goal) => {
    const selection = document.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const caret = range?.getBoundingClientRect();
    const node = range?.startContainer;
    const element =
      node?.nodeType === 1 ? (node as Element) : node?.parentElement;
    const line =
      element?.closest('.cm-line') ??
      element?.closest('[data-editor-node="element"]');
    if (!caret || !line) return Number.POSITIVE_INFINITY;
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    const probe = document.createRange();
    let best = Number.POSITIVE_INFINITY;
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      for (let offset = 0; offset <= (text as Text).length; offset++) {
        probe.setStart(text, offset);
        probe.setEnd(text, offset);
        const rect = probe.getClientRects()[0];
        if (rect && Math.abs(rect.top - caret.top) < 2) {
          best = Math.min(best, Math.abs(rect.left - goal));
        }
      }
    }
    return Math.abs(caret.left - goal) - best;
  }, goalX);

test('code-block: vertical arrows keep the caret column across CodeMirror', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto(ROUTE, { waitUntil: 'commit' });
    const editor = createBrowserEditorHarness(
      page,
      'code-block:vertical-column',
      page.locator(EDITOR_ROOT).first()
    );
    await editor.ready({ editor: 'visible', text: 'Huge Code Block' });
    const input = page.locator('[data-code-block-codemirror-input]');
    const codePath = [HUGE_CODE_BLOCK_INDEX, 0];
    const code = await editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX);
    const lastLineStart = code!.lastIndexOf('\n') + 1;
    const focusOffset = async () => {
      const selection = await editor.get.selection();
      return selection?.focus.offset ?? -1;
    };
    const expectTypedAtCaret = async (blockIndex: number) => {
      const before = await editor.get.modelBlockText(blockIndex);
      const offset = await focusOffset();
      await page.keyboard.type('Z');
      await expect
        .poll(() => editor.get.modelBlockText(blockIndex))
        .toBe(`${before!.slice(0, offset)}Z${before!.slice(offset)}`);
      await page.keyboard.press('Backspace');
      await expect
        .poll(() => editor.get.modelBlockText(blockIndex))
        .toBe(before);
    };

    await test.step("Entering going down lands on the code's first line under the caret", async () => {
      await editor.selection.collapse({
        path: [HUGE_CODE_BLOCK_INDEX - 1, 0],
        offset: 13,
      });
      await editor.focus();
      const paragraphAbove = await readCaret(page);
      await page.keyboard.press('ArrowDown');
      await expect(input).toBeFocused();
      await expect
        .poll(async () => distanceBeyondNearestCaret(page, paragraphAbove!.x))
        .toBeLessThan(0.5);
      expect(await focusOffset()).toBeGreaterThan(0);
      expect(await focusOffset()).toBeLessThanOrEqual(code!.indexOf('\n'));
      await expectTypedAtCaret(HUGE_CODE_BLOCK_INDEX);
    });

    await test.step('Leaving going up lands in the paragraph under the code caret', async () => {
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      const firstCodeLine = await readCaret(page);
      await page.keyboard.press('ArrowUp');
      await expect(input).not.toBeFocused();
      await expect
        .poll(async () => distanceBeyondNearestCaret(page, firstCodeLine!.x))
        .toBeLessThan(0.5);
      await expectTypedAtCaret(HUGE_CODE_BLOCK_INDEX - 1);
    });

    await test.step('Entering going up lands on the unrendered last line, scrolled into view', async () => {
      await editor.selection.collapse({
        path: [HUGE_CODE_BLOCK_INDEX + 1, 0],
        offset: 12,
      });
      await editor.focus();
      const paragraphBelow = await readCaret(page);
      await page.keyboard.press('ArrowUp');
      await expect(input).toBeFocused();
      await expect
        .poll(async () => (await focusOffset()) > lastLineStart)
        .toBe(true);
      await expect
        .poll(async () => {
          const caret = await readCaret(page);
          return caret?.inScroller;
        })
        .toBe(true);
      expect(
        await distanceBeyondNearestCaret(page, paragraphBelow!.x)
      ).toBeLessThan(0.5);
      await expectTypedAtCaret(HUGE_CODE_BLOCK_INDEX);
    });

    await test.step('Leaving going down lands in the paragraph under the code caret', async () => {
      const lastCodeLine = await readCaret(page);
      await page.keyboard.press('ArrowDown');
      await expect(input).not.toBeFocused();
      await expect
        .poll(async () => distanceBeyondNearestCaret(page, lastCodeLine!.x))
        .toBeLessThan(0.5);
      await expectTypedAtCaret(HUGE_CODE_BLOCK_INDEX + 1);
    });

    await test.step("A short first line keeps the longer line's column on the way out", async () => {
      await editor.selection.collapse({ path: codePath, offset: 0 });
      await editor.focus();
      await expect(input).toBeFocused();
      await page.keyboard.type('ab');
      await page.keyboard.press('Enter');
      for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
      const longLine = await readCaret(page);
      await page.keyboard.press('ArrowUp');
      await expect.poll(focusOffset).toBe(2);
      await page.keyboard.press('ArrowUp');
      await expect(input).not.toBeFocused();
      await expect
        .poll(async () => distanceBeyondNearestCaret(page, longLine!.x))
        .toBeLessThan(0.5);
    });

    await test.step("Entering onto the short first line keeps the paragraph's column below it", async () => {
      const paragraphColumn = await readCaret(page);
      await page.keyboard.press('ArrowDown');
      await expect(input).toBeFocused();
      await expect.poll(focusOffset).toBe(2);
      await page.keyboard.press('ArrowDown');
      await expect
        .poll(async () => distanceBeyondNearestCaret(page, paragraphColumn!.x))
        .toBeLessThan(0.5);
      await expectTypedAtCaret(HUGE_CODE_BLOCK_INDEX);
    });

    await test.step("ArrowLeft right after entering still leaves at the paragraph's end", async () => {
      const above = await editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX - 1);
      await editor.selection.collapse({
        path: [HUGE_CODE_BLOCK_INDEX - 1, 0],
        offset: 0,
      });
      await editor.focus();
      await page.keyboard.press('ArrowDown');
      await expect(input).toBeFocused();
      await expect.poll(focusOffset).toBe(0);
      await page.keyboard.press('ArrowLeft');
      await expect(input).not.toBeFocused();
      await editor.assert.selection({
        anchor: { path: [HUGE_CODE_BLOCK_INDEX - 1, 0], offset: above!.length },
        focus: { path: [HUGE_CODE_BLOCK_INDEX - 1, 0], offset: above!.length },
      });
    });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

for (const key of ['Enter', 'Tab']) {
  test(`code-block: composing ${key} leaves code unchanged`, async ({
    page,
  }) => {
    await page.goto(ROUTE, { waitUntil: 'commit' });
    const editor = createBrowserEditorHarness(
      page,
      `code-block:composition-${key}`,
      page.locator(EDITOR_ROOT).first()
    );
    await editor.ready({ editor: 'visible', text: 'Huge Code Block' });
    const initial = await editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX);
    await editor.selection.collapse({
      path: [HUGE_CODE_BLOCK_INDEX, 0],
      offset: 0,
    });
    await editor.focus();
    const prevented = await page
      .locator('[data-code-block-codemirror-input]')
      .evaluate((input, composingKey) => {
        input.dispatchEvent(
          new CompositionEvent('compositionstart', { bubbles: true })
        );
        const event = new KeyboardEvent('keydown', {
          key: composingKey,
          code: composingKey,
          bubbles: true,
          cancelable: true,
          isComposing: true,
        });
        input.dispatchEvent(event);
        input.dispatchEvent(
          new CompositionEvent('compositionend', { bubbles: true })
        );
        return event.defaultPrevented;
      }, key);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        })
    );
    expect(prevented).toBe(false);
    expect(await editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX)).toBe(
      initial
    );
    await page.keyboard.insertText('x');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(`x${initial}`);
  });
}

test('code-block: Tab indents a leading empty line', async ({ page }) => {
  await page.goto(ROUTE, { waitUntil: 'commit' });
  const editor = createBrowserEditorHarness(
    page,
    'code-block:leading-empty-line',
    page.locator(EDITOR_ROOT).first()
  );
  await editor.ready({ editor: 'visible', text: 'Huge Code Block' });
  const initial = await editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX);
  await editor.selection.select({
    anchor: { path: [2, 0], offset: 0 },
    focus: { path: [2, 0], offset: initial!.length },
  });
  await editor.focus();
  await page.keyboard.insertText('\nalpha');
  await expect.poll(() => editor.get.modelBlockText(2)).toBe('\nalpha');
  await editor.selection.collapse({ path: [2, 0], offset: 0 });
  await editor.focus();
  await page.keyboard.press('Tab');
  await expect.poll(() => editor.get.modelBlockText(2)).toBe('  \nalpha');
  await editor.assert.selection({
    anchor: { path: [2, 0], offset: 2 },
    focus: { path: [2, 0], offset: 2 },
  });
  await page.keyboard.press('Shift+Tab');
  await expect.poll(() => editor.get.modelBlockText(2)).toBe('\nalpha');
});

test('code-block: native commands indent lines and expand a syntax block', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto(ROUTE, { waitUntil: 'commit' });
    const editor = createBrowserEditorHarness(
      page,
      'code-block:native-commands',
      page.locator(EDITOR_ROOT).first()
    );
    await editor.ready({ editor: 'visible', text: 'Huge Code Block' });
    const initial = await editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX);
    await editor.selection.select({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: initial!.length },
    });
    await editor.focus();
    await page.keyboard.insertText('function run() {}');
    await expect
      .poll(() => editor.get.modelBlockText(2))
      .toBe('function run() {}');
    await editor.selection.collapse({ path: [2, 0], offset: 8 });
    await editor.focus();
    await page.keyboard.press('Tab');
    await expect
      .poll(() => editor.get.modelBlockText(2))
      .toBe('  function run() {}');
    await page.keyboard.press('Shift+Tab');
    await expect
      .poll(() => editor.get.modelBlockText(2))
      .toBe('function run() {}');
    await editor.selection.collapse({ path: [2, 0], offset: 16 });
    await editor.focus();
    await page.keyboard.press('Enter');
    await expect
      .poll(() => editor.get.modelBlockText(2))
      .toBe('function run() {\n  \n}');
    await page.keyboard.press('ControlOrMeta+z');
    await expect
      .poll(() => editor.get.modelBlockText(2))
      .toBe('function run() {}');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
