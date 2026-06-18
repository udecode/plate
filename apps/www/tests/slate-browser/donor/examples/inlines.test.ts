import { expect, type Page, test } from '@playwright/test';
import {
  assertNoIllegalKernelTransitions,
  createSlateBrowserInlineCutTypingGauntlet,
  openExample,
  recordSlateBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

const getBrowserWordBackwardDeleteCandidates = async (page: Page) =>
  page.evaluate(() =>
    navigator.platform.includes('Mac')
      ? ['Alt+Backspace', 'Control+Backspace']
      : ['Control+Backspace', 'Alt+Backspace']
  );

const getPlainContenteditableWordDeleteResult = async ({
  caretOffset,
  key,
  page,
  text,
}: {
  caretOffset: number;
  key: string;
  page: Page;
  text: string;
}) => {
  await page.evaluate(
    ({ caretOffset, text }) => {
      document
        .querySelector('[data-slate-plain-word-delete-host="true"]')
        ?.remove();

      const host = document.createElement('div');
      host.contentEditable = 'true';
      host.dataset.slatePlainWordDeleteHost = 'true';
      host.style.cssText =
        'position: fixed; left: 0; top: 0; width: 1200px; min-height: 1px; opacity: 0; white-space: pre-wrap;';
      host.textContent = text;
      document.body.append(host);

      const textNode = host.firstChild;

      if (!textNode) {
        throw new Error('plain word-delete host has no text node');
      }

      const range = document.createRange();
      range.setStart(textNode, caretOffset);
      range.collapse(true);

      const selection = document.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      host.focus();
    },
    { caretOffset, text }
  );

  await page.keyboard.press(key);

  return page.evaluate(() => {
    const host = document.querySelector(
      '[data-slate-plain-word-delete-host="true"]'
    ) as HTMLElement | null;

    if (!host) {
      throw new Error('plain word-delete host was removed before readback');
    }

    const result = host.innerText.replaceAll('\u00A0', ' ');
    host.remove();

    return result;
  });
};

const normalizeInlineSelectionText = (text: string) =>
  text
    .replaceAll('\u00A0', ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,!.])/g, '$1')
    .trim();

test.describe('Inlines example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/slate/inlines');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('contains link', async ({ page }) => {
    expect(
      await page.getByRole('textbox').locator('a').nth(0).innerText()
    ).toContain('hyperlink');
  });

  test('wraps typed URL text as a link command', async ({ page }) => {
    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.insertText('https://example.com');

    const link = editor.root.locator('a[href="https://example.com/"]');
    await expect(link).toHaveCount(1);
    await expect(link).toContainText('https://example.com');
  });

  test('inserts a toolbar link at a collapsed selection', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const url = 'https://example.com/new-link';

    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept(url);
    });
    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await page.getByRole('button', { exact: true, name: 'Link' }).click();

    const link = editor.root.locator('a[href="https://example.com/new-link"]');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveText(url);
    await editor.type(' after');
    await expect(link).not.toContainText('after');
  });

  test('keeps selected text selected after toolbar link wrapping', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const url = 'https://example.com/selected-link';
    const beforeSelectedText = 'In addition to block nodes, you can create ';
    const selectedText = 'inline nodes';

    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept(url);
    });
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: beforeSelectedText.length },
      focus: {
        path: [0, 0],
        offset: beforeSelectedText.length + selectedText.length,
      },
    });
    await page.getByRole('button', { exact: true, name: 'Link' }).click();

    const link = editor.root.locator(
      'a[href="https://example.com/selected-link"]'
    );
    await expect(link).toHaveText(selectedText);
    await expect
      .poll(async () =>
        (await editor.get.selectedText()).replaceAll('\u00A0', ' ')
      )
      .toBe(selectedText);
  });

  test('wraps backward selected text as one link', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const url = 'https://example.com/backward-link';
    const beforeSelectedText = 'In addition to block nodes, you can create ';
    const selectedText = 'inline nodes';

    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept(url);
    });
    await editor.selection.selectDOM({
      anchor: {
        path: [0, 0],
        offset: beforeSelectedText.length + selectedText.length,
      },
      focus: { path: [0, 0], offset: beforeSelectedText.length },
    });
    await page.getByRole('button', { exact: true, name: 'Link' }).click();

    const link = editor.root.locator(
      'a[href="https://example.com/backward-link"]'
    );

    await expect(link).toHaveCount(1);
    await expect(link).toHaveText(selectedText);
    await expect
      .poll(async () =>
        (await editor.get.selectedText()).replaceAll('\u00A0', ' ')
      )
      .toBe(selectedText);
    await editor.assert.noDoubleSelectionHighlight();
  });

  test('collapses after auto-linking selected text with a typed URL', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const url = 'https://example.com/auto-selected';
    const beforeSelectedText = 'In addition to block nodes, you can create ';
    const selectedText = 'inline nodes';

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: beforeSelectedText.length },
      focus: {
        path: [0, 0],
        offset: beforeSelectedText.length + selectedText.length,
      },
    });
    await editor.insertText(url);

    const link = editor.root.locator(`a[href="${url}"]`);
    await expect(link).toHaveText(selectedText);
    await expect.poll(() => editor.get.selectedText()).toBe('');

    await editor.insertText(' after');
    await expect(link).toHaveText(selectedText);
    await expect
      .poll(() => editor.get.modelText())
      .toContain('inline nodes after');
  });

  test('types a fullwidth punctuation character after a toolbar link once', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const url = 'https://example.com/fullwidth-link';

    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept(url);
    });
    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await page.getByRole('button', { exact: true, name: 'Link' }).click();
    await page.keyboard.insertText('，');

    const link = editor.root.locator(
      'a[href="https://example.com/fullwidth-link"]'
    );
    await expect(link).toHaveCount(1);
    await expect(link).toHaveText(url);
    await expect(link).not.toContainText('，');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain(`${url}，In addition to block nodes`);
  });

  test('wraps punctuation-separated typed URLs without recursion', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.insertText('https://example.com, https://slatejs.org! ');

    await expect(
      editor.root.locator('a[href="https://example.com/"]')
    ).toHaveCount(1);
    await expect(
      editor.root.locator('a[href="https://slatejs.org/"]')
    ).toHaveCount(1);
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain(
        'https://example.com, https://slatejs.org! In addition to block nodes'
      );
  });

  test('wraps pasted URL text as a link command', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.clipboard.pasteText('https://example.com');

    const link = editor.root.locator('a[href="https://example.com/"]');
    await expect(link).toHaveCount(1);
    await expect(link).toContainText('https://example.com');

    await editor.type(' after');

    await expect(link).not.toContainText('after');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('https://example.com afterIn addition to block nodes');
  });

  test('places Enter after a typed inline link outside the link', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.insertText('https://example.com');
    await editor.press('Enter');

    const link = editor.root.locator('a[href="https://example.com/"]');
    await expect(link).toHaveCount(1);
    await expect(link).toContainText('https://example.com');
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });

    await editor.type('outside ');

    await expect(link).not.toContainText('outside');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[1]?.replaceAll('\u00A0', '')
      )
      .toContain('outside In addition to block nodes');
  });

  test('types inside an editable inline at its end', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 1, 0], offset: 'hyperlink'.length },
      focus: { path: [0, 1, 0], offset: 'hyperlink'.length },
    });
    await page.keyboard.type(' inside');

    await expect(editor.root.locator('a').first()).toContainText(
      'hyperlink inside'
    );
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 1, 0], offset: 'hyperlink inside'.length },
        focus: { path: [0, 1, 0], offset: 'hyperlink inside'.length },
      });
  });

  test('keeps an editable inline live after deleting its last character', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/inlines', {
        ready: {
          editor: 'visible',
        },
      });
      const link = editor.root.locator(
        'a[href="https://en.wikipedia.org/wiki/Hypertext"]'
      );
      const followingLink = editor.root.locator(
        'a[href="https://twitter.com/JustMissEmma/status/1448679899531726852"]'
      );

      await editor.selection.selectDOM({
        anchor: { path: [0, 1, 0], offset: 'hyperlink'.length },
        focus: { path: [0, 1, 0], offset: 'hyperlink'.length },
      });

      for (const _character of 'hyperlink') {
        await editor.root.press('Backspace');
      }

      runtimeErrors.assertNone();
      await expect(link).toHaveCount(0);
      await expect(editor.root.locator('br')).toHaveCount(0);

      await page.keyboard.type('x');

      runtimeErrors.assertNone();
      await expect(followingLink).not.toContainText('x');
      await expect
        .poll(async () =>
          (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
        )
        .toContain('Here is a x, and here is a more unusual inline');
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps the start of following text distinct from the end of an inline', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 2], offset: 0 },
      focus: { path: [0, 2], offset: 0 },
    });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [0, 2],
      isCollapsed: true,
    });

    await page.keyboard.type(' outside');

    await expect(editor.root.locator('a').first()).toContainText('hyperlink');
    await expect(editor.root.locator('a').first()).not.toContainText('outside');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a hyperlink outside, and here is');
  });

  test('keeps typed text before an inline link outside the link', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeLinkText =
      'In addition to block nodes, you can create inline nodes. Here is a ';
    const insertedText = 'before ';

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: beforeLinkText.length },
      focus: { path: [0, 0], offset: beforeLinkText.length },
    });
    await editor.assert.domSelectionTarget({
      anchorOffset: beforeLinkText.length,
      anchorPath: [0, 0],
      isCollapsed: true,
    });

    await page.keyboard.type(insertedText);

    const link = editor.root.locator('a').first();

    await expect(link).toContainText('hyperlink');
    await expect(link).not.toContainText('before');
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: {
          path: [0, 0],
          offset: beforeLinkText.length + insertedText.length,
        },
        focus: {
          path: [0, 0],
          offset: beforeLinkText.length + insertedText.length,
        },
      });
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a before hyperlink, and here is');
  });

  test('types before an inline link at the start of a paragraph', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeLinkText =
      'In addition to block nodes, you can create inline nodes. Here is a ';

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: beforeLinkText.length },
    });
    await editor.deleteFragment();
    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await page.keyboard.type('lead ');

    const link = editor.root.locator(
      'a[href="https://en.wikipedia.org/wiki/Hypertext"]'
    );
    await expect(link).toHaveText('hyperlink');
    await expect(link).not.toContainText('lead');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('lead hyperlink, and here is a more unusual inline');
  });

  test('pastes content outside inline link boundaries without expanding the link', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeLinkText =
      'In addition to block nodes, you can create inline nodes. Here is a ';

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: beforeLinkText.length },
      focus: { path: [0, 0], offset: beforeLinkText.length },
    });
    await editor.clipboard.pasteText('before ');

    await editor.selection.selectDOM({
      anchor: { path: [0, 2], offset: 0 },
      focus: { path: [0, 2], offset: 0 },
    });
    await editor.clipboard.pasteHtml('<strong>after</strong> ', 'after ');

    const link = editor.root.locator('a').first();

    await expect(link).toContainText('hyperlink');
    await expect(link).not.toContainText('before');
    await expect(link).not.toContainText('after');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a before hyperlinkafter , and here is');
  });

  test('keeps replacement text inside selected link text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const link = editor.root.locator('a').first();

    await editor.selection.select({
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 1 },
    });
    await editor.type('H');

    await expect(link).toHaveText('Hyperlink');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a Hyperlink, and here is');
  });

  test('keeps typing outside a surviving inline link after deleting edge text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    let editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeLinkText =
      'In addition to block nodes, you can create inline nodes. Here is a ';
    let link = editor.root.locator('a').first();

    await editor.selection.selectDOM({
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 1 },
    });
    await editor.root.press('Backspace');
    await page.keyboard.type('XY');

    await expect(link).toHaveText('yperlink');
    await expect(link).not.toContainText('XY');
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: beforeLinkText.length + 2 },
        focus: { path: [0, 0], offset: beforeLinkText.length + 2 },
      });
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a XYyperlink, and here is');

    await page.goto('/examples/slate/inlines');
    editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    link = editor.root.locator('a').first();

    await editor.selection.selectDOM({
      anchor: { path: [0, 1, 0], offset: 'hyperlin'.length },
      focus: { path: [0, 1, 0], offset: 'hyperlink'.length },
    });
    await editor.root.press('Delete');
    await page.keyboard.type('XY');

    await expect(link).toHaveText('hyperlin');
    await expect(link).not.toContainText('XY');
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 2], offset: 2 },
        focus: { path: [0, 2], offset: 2 },
      });
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a hyperlinXY, and here is');
  });

  test('pastes plain text inside an inline link without splitting it', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({
      path: [0, 1, 0],
      offset: 'hyper'.length,
    });
    await editor.clipboard.pasteText('TEXT');

    const link = editor.root.locator(
      'a[href="https://en.wikipedia.org/wiki/Hypertext"]'
    );

    await expect(link).toHaveCount(1);
    await expect(link).toHaveText('hyperTEXTlink');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a hyperTEXTlink, and here is');
  });

  test('keeps typing after a link-boundary Backspace outside the link', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const link = editor.root.locator('a').first();

    await editor.selection.collapse({ path: [0, 2], offset: 0 });
    await editor.focus();
    await editor.root.press('Backspace');
    await editor.type('tail');

    await expect(link).not.toContainText('tail');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a hyperlintail, and here is');
  });

  test('keeps text typed after a link when arrowing back into the link', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const insertedText = 'tail';

    await editor.selection.collapse({ path: [0, 2], offset: 0 });
    await editor.focus();
    await editor.type(insertedText);

    for (let index = 0; index < insertedText.length + 2; index += 1) {
      await editor.root.press('ArrowLeft');
    }

    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a hyperlinktail, and here is');
    await expect.poll(() => editor.get.selection()).not.toBe(null);
  });

  test('replaces selected text adjacent to inline link boundaries with rich content', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    let editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeLinkText =
      'In addition to block nodes, you can create inline nodes. Here is a ';
    const selectedBeforeLinkText = 'Here is a ';

    await editor.selection.selectDOM({
      anchor: {
        path: [0, 0],
        offset: beforeLinkText.length - selectedBeforeLinkText.length,
      },
      focus: { path: [0, 0], offset: beforeLinkText.length },
    });
    await editor.clipboard.pasteHtml('<strong>replaced</strong>', 'replaced');

    let link = editor.root.locator('a').first();
    await expect(link).toContainText('hyperlink');
    await expect(link).not.toContainText('replaced');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('inline nodes. replacedhyperlink, and here is');

    await page.goto('/examples/slate/inlines');
    editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const selectedAfterLinkText = ', and here';

    await editor.selection.selectDOM({
      anchor: { path: [0, 2], offset: 0 },
      focus: { path: [0, 2], offset: selectedAfterLinkText.length },
    });
    await editor.clipboard.pasteHtml('<em>replaced</em>', 'replaced');

    link = editor.root.locator('a').first();
    await expect(link).toContainText('hyperlink');
    await expect(link).not.toContainText('replaced');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a hyperlinkreplaced is a more unusual inline');
  });

  test('replaces selected inline link text with rich content outside the surviving link', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 'hyper'.length },
    });
    await editor.clipboard.pasteHtml('<strong>replaced</strong>', 'replaced');

    const link = editor.root.locator('a').first();
    const beforeLinkText =
      'In addition to block nodes, you can create inline nodes. Here is a ';

    await expect(link).toContainText('link');
    await expect(link).not.toContainText('replaced');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a replacedlink, and here is');
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: {
          path: [0, 0],
          offset: beforeLinkText.length + 'replaced'.length,
        },
        focus: {
          path: [0, 0],
          offset: beforeLinkText.length + 'replaced'.length,
        },
      });
  });

  test('copies and pastes only selected inline link text', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');
    test.skip(
      testInfo.project.name === 'webkit',
      'WebKit blocks privileged clipboard reads in Playwright'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const initialLinkCount = await editor.root.locator('a').count();

    await editor.selection.select({
      anchor: { path: [0, 1, 0], offset: 2 },
      focus: { path: [0, 1, 0], offset: 5 },
    });
    await editor.root.press('ControlOrMeta+C');

    await expect.poll(() => editor.clipboard.readText()).toBe('per');

    await editor.selection.collapse({ path: [0, 2], offset: 0 });
    await editor.root.press('ControlOrMeta+V');

    await expect(editor.root.locator('a')).toHaveCount(initialLinkCount + 1);
    await expect(editor.root.locator('a').first()).toHaveText('hyperlink');
    await expect(editor.root.locator('a').nth(1)).toHaveText('per');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a hyperlinkper, and here is');
  });

  test('triple-clicking a paragraph that starts with a link selects the whole paragraph', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeLinkText =
      'In addition to block nodes, you can create inline nodes. Here is a ';

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: beforeLinkText.length },
    });
    await editor.root.press('Backspace');
    await expect(editor.root.locator('a').first()).toHaveText('hyperlink');
    const firstBlockText = (await editor.get.blockTexts())[0]?.replaceAll(
      '\u00A0',
      ''
    );

    await page
      .locator('[data-slate-editor] p')
      .first()
      .click({ clickCount: 3 });

    await expect
      .poll(async () =>
        normalizeInlineSelectionText(await editor.get.selectedText())
      )
      .toBe(firstBlockText);
  });

  test('triple-clicking through a read-only inline selects the whole paragraph', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const firstBlockText = (await editor.get.blockTexts())[0]?.replaceAll(
      '\u00A0',
      ''
    );

    await page.locator('[data-slate-path="0,5"]').click({ clickCount: 3 });

    await expect
      .poll(async () =>
        normalizeInlineSelectionText(await editor.get.selectedText())
      )
      .toBe(firstBlockText);
  });

  test('clicking a trailing inline link keeps selection valid', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/inlines', {
        ready: {
          editor: 'visible',
        },
      });
      const trailingLink = editor.root
        .locator('a')
        .filter({ hasText: 'Finally, here is our favorite dog video.' });

      await expect(trailingLink).toHaveCount(1);
      await trailingLink.evaluate((element) => {
        element.addEventListener('click', (event) => event.preventDefault(), {
          capture: true,
          once: true,
        });
      });
      await trailingLink.click();

      runtimeErrors.assertNone();
      await expect.poll(() => editor.get.selection()).not.toBe(null);
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.rangeCount ?? 0))
        .toBeGreaterThan(0);
    } finally {
      runtimeErrors.stop();
    }
  });

  test('clicking after a trailing inline link places the caret after it', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/inlines', {
        ready: {
          editor: 'visible',
        },
      });
      const trailingLink = editor.root
        .locator('a')
        .filter({ hasText: 'Finally, here is our favorite dog video.' });
      const paragraph = editor.root.locator('p').nth(1);
      const clickPoint = await trailingLink.evaluate((link) => {
        const paragraph = link.closest('p');

        if (!(paragraph instanceof HTMLElement)) {
          throw new Error('Expected trailing inline paragraph');
        }

        const linkRect = link.getBoundingClientRect();
        const paragraphRect = paragraph.getBoundingClientRect();

        return {
          x: Math.min(linkRect.right + 8, paragraphRect.right - 4),
          y: linkRect.top + linkRect.height / 2,
        };
      });

      await expect(trailingLink).toHaveCount(1);
      await expect(paragraph).toContainText(
        'Finally, here is our favorite dog video.'
      );
      await page.mouse.click(clickPoint.x, clickPoint.y);

      runtimeErrors.assertNone();
      await editor.assert.selection({
        anchor: { path: [1, 2], offset: 0 },
        focus: { path: [1, 2], offset: 0 },
      });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('typing after a trailing inline link inserts visible text after it', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/inlines', {
        ready: {
          editor: 'visible',
        },
      });
      const trailingLink = editor.root
        .locator('a')
        .filter({ hasText: 'Finally, here is our favorite dog video.' });
      const clickPoint = await trailingLink.evaluate((link) => {
        const paragraph = link.closest('p');

        if (!(paragraph instanceof HTMLElement)) {
          throw new Error('Expected trailing inline paragraph');
        }

        const linkRect = link.getBoundingClientRect();
        const paragraphRect = paragraph.getBoundingClientRect();

        return {
          x: Math.min(linkRect.right + 8, paragraphRect.right - 4),
          y: linkRect.top + linkRect.height / 2,
        };
      });

      await expect(trailingLink).toHaveCount(1);
      await page.mouse.click(clickPoint.x, clickPoint.y);
      await editor.type(' tail');

      runtimeErrors.assertNone();
      await expect(trailingLink).not.toContainText('tail');
      await expect
        .poll(async () =>
          (await editor.get.blockTexts())[1]?.replaceAll('\u00A0', '')
        )
        .toContain('Finally, here is our favorite dog video. tail');
      await editor.assert.selection({
        anchor: { path: [1, 2], offset: ' tail'.length },
        focus: { path: [1, 2], offset: ' tail'.length },
      });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('triple-click Backspace removes a paragraph that ends with a link', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const trailingLink = editor.root
      .locator('a')
      .filter({ hasText: 'Finally, here is our favorite dog video.' });
    const secondBlockText =
      (await editor.get.blockTexts())[1]?.replaceAll('\u00A0', '') ?? '';

    await expect(trailingLink).toHaveCount(1);
    await page.locator('[data-slate-editor] p').nth(1).click({ clickCount: 3 });
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 2], offset: 0 },
    });
    await editor.assert.noDoubleSelectionHighlight();
    await editor.root.press('Backspace');

    await expect
      .poll(() => editor.get.modelText())
      .not.toContain(secondBlockText);
    await expect(trailingLink).toHaveCount(0);
  });

  test('triple-click paste replaces a paragraph that ends with a link', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const trailingLink = editor.root
      .locator('a')
      .filter({ hasText: 'Finally, here is our favorite dog video.' });
    const secondBlockText = (await editor.get.blockTexts())[1]?.replaceAll(
      '\u00A0',
      ''
    );

    await expect(trailingLink).toHaveCount(1);
    await page.locator('[data-slate-editor] p').nth(1).click({ clickCount: 3 });
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 2], offset: 0 },
    });
    await editor.assert.noDoubleSelectionHighlight();
    await expect
      .poll(async () =>
        normalizeInlineSelectionText(await editor.get.selectedText())
      )
      .toBe(secondBlockText);

    await editor.clipboard.pasteText('replacement');

    await expect.poll(() => editor.get.modelText()).toContain('replacement');
    await expect
      .poll(() => editor.get.modelText())
      .not.toContain(secondBlockText);
    await expect(trailingLink).toHaveCount(0);
  });

  test('mouse drag undo restores typed plain text replacement', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop native drag proof');

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const text =
      'There are two ways to add links. You can either add a link via the toolbar icon above, or if you want in on a little secret, copy a URL to your clipboard and paste it while a range of text is selected. ';
    const selectionStart = 'There are two ways to add '.length;
    const selectionEnd = selectionStart + 'links'.length;

    await editor.selection.dragTextRange({
      endOffset: selectionEnd,
      startOffset: selectionStart,
      text,
    });

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('links');

    await page.keyboard.type('URLs');
    await expect
      .poll(async () => (await editor.get.blockTexts())[1])
      .toContain('There are two ways to add URLs. You');

    await page.keyboard.press(
      await editor.root.evaluate(() =>
        /Mac OS X/.test(navigator.userAgent) ? 'Meta+Z' : 'Control+Z'
      )
    );

    await expect
      .poll(async () => (await editor.get.blockTexts())[1])
      .toContain('There are two ways to add links. You');
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: selectionStart },
      focus: { path: [1, 0], offset: selectionEnd },
    });
    await expect.poll(() => editor.get.selectedText()).toBe('links');
  });

  test('mouse drag undo restores typed inline link text replacement', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop native drag proof');

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const text = 'hyperlink';

    if (testInfo.project.name === 'firefox') {
      await editor.dom.collapseAtTextPath({
        offset: text.length,
        path: [0, 1, 0],
      });
    }

    await editor.selection.dragTextRange({
      direction: testInfo.project.name === 'firefox' ? 'backward' : 'forward',
      endOffset: text.length,
      startOffset: 0,
      text,
    });

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe(text);

    await page.keyboard.type('wiki');
    await expect(editor.root.locator('a').first()).toHaveText('wiki');

    await page.keyboard.press(
      await editor.root.evaluate(() =>
        /Mac OS X/.test(navigator.userAgent) ? 'Meta+Z' : 'Control+Z'
      )
    );

    await expect(editor.root.locator('a').first()).toHaveText(text);
    const expectedSelection =
      testInfo.project.name === 'firefox'
        ? {
            anchor: { path: [0, 1, 0], offset: text.length },
            focus: { path: [0, 1, 0], offset: 0 },
          }
        : {
            anchor: { path: [0, 1, 0], offset: 0 },
            focus: { path: [0, 1, 0], offset: text.length },
          };

    await editor.assert.selection({
      anchor: expectedSelection.anchor,
      focus: expectedSelection.focus,
    });
    await expect.poll(() => editor.get.selectedText()).toBe(text);
  });

  test('places the caret outside a padded inline before typing', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeButtonText = ', and here is a more unusual inline: an ';

    await editor.selection.selectDOM({
      anchor: { path: [0, 2], offset: beforeButtonText.length },
      focus: { path: [0, 2], offset: beforeButtonText.length },
    });
    await editor.assert.domSelectionTarget({
      anchorOffset: beforeButtonText.length,
      anchorPath: [0, 2],
      isCollapsed: true,
    });

    const caretRect = await editor.selection.rect();
    const buttonLeft = await editor.root
      .locator('[data-slate-path="0,3"]')
      .first()
      .evaluate((element) => element.getBoundingClientRect().left);

    expect(caretRect).not.toBeNull();
    expect(caretRect!.x).toBeLessThanOrEqual(buttonLeft + 1);
  });

  test('removes an empty editable inline with Backspace without deleting preceding text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeButtonText = ', and here is a more unusual inline: an ';
    const buttonText = 'editable button';

    await editor.selection.selectDOM({
      anchor: { path: [0, 3, 0], offset: 0 },
      focus: { path: [0, 3, 0], offset: buttonText.length },
    });
    await page.keyboard.press('Backspace');

    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain(`${beforeButtonText}! Here is a read-only inline`);
    await editor.assert.selection({
      anchor: { path: [0, 3, 0], offset: 0 },
      focus: { path: [0, 3, 0], offset: 0 },
    });
    await editor.assert.domSelectionTarget({
      anchorOffset: 1,
      anchorPath: [0, 3, 0],
      isCollapsed: true,
    });

    await page.keyboard.press('Backspace');

    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain(`${beforeButtonText}! Here is a read-only inline`);
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .not.toContain(', and here is a more unusual inline: a! Here');
    await expect.poll(() => editor.get.selection()).not.toBe(null);
    await editor.assert.domSelectionTarget({
      isCollapsed: true,
    });
  });

  test('arrow keys skip over read-only inline', async ({ page }) => {
    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeBadgeText = '! Here is a read-only inline: ';

    await editor.selection.collapse({ path: [0, 6], offset: 0 });
    await editor.focus();
    await editor.assert.selection({
      anchor: { path: [0, 6], offset: 0 },
      focus: { path: [0, 6], offset: 0 },
    });

    await editor.root.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { path: [0, 4], offset: beforeBadgeText.length },
      focus: { path: [0, 4], offset: beforeBadgeText.length },
    });

    await editor.root.press('ArrowRight');
    await editor.assert.selection({
      anchor: { path: [0, 6], offset: 0 },
      focus: { path: [0, 6], offset: 0 },
    });
    await expect
      .poll(() => editor.get.kernelTrace())
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            command: expect.objectContaining({
              axis: 'horizontal',
              kind: 'move-selection',
            }),
            eventFamily: 'keydown',
            movement: expect.objectContaining({
              axis: 'horizontal',
              ownership: 'model-owned',
              reason: 'model-horizontal-inline-void',
            }),
          }),
        ])
      );
  });

  test('steps caret by offset across inline link boundaries', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline navigation proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeLinkText =
      'In addition to block nodes, you can create inline nodes. Here is a ';

    await editor.selection.collapse({
      path: [0, 0],
      offset: beforeLinkText.length,
    });
    await editor.focus();

    await editor.root.press('ArrowRight');
    await editor.assert.selection({
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [0, 1, 0],
      isCollapsed: true,
    });

    await editor.root.press('ArrowRight');
    await editor.assert.selection({
      anchor: { path: [0, 1, 0], offset: 1 },
      focus: { path: [0, 1, 0], offset: 1 },
    });

    await editor.root.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    });

    await editor.root.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: beforeLinkText.length },
      focus: { path: [0, 0], offset: beforeLinkText.length },
    });

    await editor.root.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: beforeLinkText.length - 1 },
      focus: { path: [0, 0], offset: beforeLinkText.length - 1 },
    });
  });

  test('pastes before a read-only inline without dropping following content', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeBadgeText = '! Here is a read-only inline: ';
    const pastedText = 'PASTE ';

    await editor.selection.collapse({
      path: [0, 4],
      offset: beforeBadgeText.length,
    });
    await editor.clipboard.pasteText(pastedText);

    await expect(editor.root.locator('.slate-inlines-badge')).toHaveText(
      'Approved'
    );
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain(`${beforeBadgeText}${pastedText}Approved.`);
    await editor.assert.selection({
      anchor: {
        path: [0, 4],
        offset: beforeBadgeText.length + pastedText.length,
      },
      focus: {
        path: [0, 4],
        offset: beforeBadgeText.length + pastedText.length,
      },
    });
  });

  test('arrow keys still skip a read-only inline after insert-delete before it', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeBadgeText = '! Here is a read-only inline: ';
    const beforeBadgePoint = {
      path: [0, 4],
      offset: beforeBadgeText.length,
    };
    const afterBadgePoint = { path: [0, 6], offset: 0 };

    await editor.selection.collapse(beforeBadgePoint);
    await editor.focus();
    await editor.type('a');
    await editor.root.press('Backspace');
    await editor.assert.selection({
      anchor: beforeBadgePoint,
      focus: beforeBadgePoint,
    });

    await editor.root.press('ArrowRight');
    await editor.assert.selection({
      anchor: afterBadgePoint,
      focus: afterBadgePoint,
    });
  });

  test('backspaces through a read-only inline after insert-delete before it without segment errors', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/inlines', {
        ready: {
          editor: 'visible',
        },
      });
      const beforeBadgeText = '! Here is a read-only inline: ';
      const beforeBadgePoint = {
        path: [0, 4],
        offset: beforeBadgeText.length,
      };
      const afterBadgePoint = { path: [0, 6], offset: 0 };

      await editor.selection.collapse(beforeBadgePoint);
      await editor.focus();
      await editor.type('a');
      await editor.root.press('Backspace');
      await editor.selection.collapse(afterBadgePoint);

      for (let i = 0; i < 4; i += 1) {
        await editor.root.press('Backspace');
      }

      runtimeErrors.assertNone();
      await expect.poll(() => editor.get.selection()).not.toBe(null);
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps caret editable after cutting inline link text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.select({
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 'hyperlink'.length },
    });

    await editor.root.press('ControlOrMeta+X');

    if (
      testInfo.project.name !== 'mobile' &&
      testInfo.project.name !== 'webkit'
    ) {
      await expect.poll(() => editor.clipboard.readText()).toBe('hyperlink');
    }
    await expect(
      editor.root.locator('a').filter({ hasText: 'hyperlink' })
    ).toHaveCount(0);
    await expect.poll(() => editor.get.selection()).not.toBe(null);

    await editor.type('LINK');

    await editor.assert.text(
      /Here is a LINK, and here is a more unusual inline/
    );
    await expect.poll(() => editor.get.selection()).not.toBe(null);
  });

  test('Backspace at an inline link end deletes one character', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({
      path: [0, 1, 0],
      offset: 'hyperlink'.length,
    });
    await editor.root.press('Backspace');

    await expect(editor.root.locator('a').first()).toHaveText('hyperlin');
    await expect.poll(() => editor.get.selection()).not.toBe(null);
  });

  test('word Backspace around an inline link matches plain editable text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop native word-delete proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeText = ((await editor.get.blockTexts())[0] ?? '').replaceAll(
      '\u00A0',
      ' '
    );
    const linkText = 'hyperlink';
    const caretOffset = beforeText.indexOf(linkText) + linkText.length;
    let expectedText: string | null = null;
    let wordBackspace: string | null = null;

    for (const candidateKey of await getBrowserWordBackwardDeleteCandidates(
      page
    )) {
      const candidateText = await getPlainContenteditableWordDeleteResult({
        caretOffset,
        key: candidateKey,
        page,
        text: beforeText,
      });

      if (beforeText.length - candidateText.length > 1) {
        expectedText = candidateText;
        wordBackspace = candidateKey;
        break;
      }
    }

    if (!expectedText || !wordBackspace) {
      test.skip(
        true,
        'No Playwright key produced native word Backspace in the plain editable reference'
      );
      throw new Error('Unreachable after test.skip');
    }

    await editor.selection.collapse({
      path: [0, 1, 0],
      offset: linkText.length,
    });
    await editor.focus();
    await page.keyboard.press(wordBackspace);

    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', ' ')
      )
      .toBe(expectedText);
    await expect.poll(() => editor.get.selection()).not.toBe(null);
    await editor.assert.noDoubleSelectionHighlight();
  });

  test('Backspace deletes selected inline link boundary text only', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 1, 0], offset: 'hyper'.length },
      focus: { path: [0, 2], offset: 0 },
    });
    await editor.assert.selection({
      anchor: { path: [0, 1, 0], offset: 'hyper'.length },
      focus: { path: [0, 2], offset: 0 },
    });
    await editor.assert.noDoubleSelectionHighlight();
    await expect
      .poll(async () =>
        (await editor.get.selectedText()).replaceAll('\u00A0', '').trimEnd()
      )
      .toBe('link');

    await editor.root.press('Backspace');

    await expect(editor.root.locator('a').first()).toHaveText('hyper');
    await expect
      .poll(async () =>
        (await editor.get.blockTexts())[0]?.replaceAll('\u00A0', '')
      )
      .toContain('Here is a hyper, and here is');
    await editor.assert.selection({
      anchor: { path: [0, 1, 0], offset: 'hyper'.length },
      focus: { path: [0, 1, 0], offset: 'hyper'.length },
    });
    await editor.assert.noDoubleSelectionHighlight();
  });

  test('runs generated inline cut typing gauntlet without illegal kernel transitions', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline editing proof'
    );

    const editor = await openExample(page, 'slate/inlines', {
      ready: {
        editor: 'visible',
      },
    });

    const result = await editor.scenario.run(
      'inlines-generated-cut-typing-gauntlet',
      createSlateBrowserInlineCutTypingGauntlet({
        domShape: {
          afterCut: {
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
            zeroWidthBreakCount: 0,
          },
          afterTyping: {
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
            zeroWidthBreakCount: 0,
          },
        },
        replacementText: 'LINK',
        selection: {
          anchor: { path: [0, 1, 0], offset: 0 },
          focus: { path: [0, 1, 0], offset: 'hyperlink'.length },
        },
        textAfterTyping: 'LINK',
      }),
      {
        metadata: {
          capabilities: ['inline-boundary', 'keyboard-cut', 'kernel-trace'],
          platform: testInfo.project.name,
          transport: 'native-keyboard',
        },
        tracePath: testInfo.outputPath('inlines-cut-typing-gauntlet.json'),
      }
    );

    assertNoIllegalKernelTransitions(result);
    await expect(
      editor.root.locator('a').filter({ hasText: 'hyperlink' })
    ).toHaveCount(0);
  });
});
