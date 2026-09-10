import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const EDITOR_ROOT = '.plite-editor[contenteditable="true"]';
const HUGE_CODE_BLOCK_INDEX = 2;
const ROUTE = '/blocks/code-block-codemirror-demo';

test.setTimeout(90_000);

test('code-block: CodeMirror keeps a 10k-line block bounded and model-owned', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(ROUTE, { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createPliteBrowserEditorHarness(
      page,
      'code-block:codemirror',
      root
    );

    await editor.ready({ editor: 'visible', text: 'Huge Code Block' });

    const inputs = page.locator('[data-code-block-codemirror-input]');
    const hugeBlock = page.locator('.plite-codeBlock').last();
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
    await expect(hugeBlock.locator('[data-plite-node="text"]')).toHaveCount(0);

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

    const probe = '__PLITE_CODEMIRROR__';
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
      nativeTextHosts: host.querySelectorAll('[data-plite-node="text"]').length,
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
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(ROUTE, { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT).first();
    const editor = createPliteBrowserEditorHarness(
      page,
      'code-block:codemirror-editing',
      root
    );

    await editor.ready({ editor: 'visible', text: 'Huge Code Block' });

    const blockIndex = HUGE_CODE_BLOCK_INDEX;
    const block = page.locator('.plite-codeBlock').first();
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

    await root.evaluate((element) => {
      (
        element as HTMLElement & {
          __pliteBrowserHandle: {
            insertTextAt: (
              text: string,
              point: { offset: number; path: number[] },
              policy: { tags: string[] }
            ) => void;
          };
        }
      ).__pliteBrowserHandle.insertTextAt(
        'REMOTE:',
        { offset: 0, path: [2, 0] },
        { tags: ['remote'] }
      );
    });
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

for (const key of ['Enter', 'Tab']) {
  test(`code-block: composing ${key} leaves code unchanged`, async ({
    page,
  }) => {
    await page.goto(ROUTE, { waitUntil: 'commit' });
    const editor = createPliteBrowserEditorHarness(
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
  const editor = createPliteBrowserEditorHarness(
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
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
  try {
    await page.goto(ROUTE, { waitUntil: 'commit' });
    const editor = createPliteBrowserEditorHarness(
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
