import { Buffer } from 'node:buffer';

import { expect, type Locator, test } from '@playwright/test';
import {
  attachSlateBrowserJsonArtifact,
  installSlateReactRenderProfiler,
  openExample,
  recordSlateBrowserRuntimeErrors,
  resetSlateReactRenderProfiler,
  takeSlateBrowserRenderStateSnapshot,
} from '@platejs/browser/playwright';

const slateCoverageErrors = new WeakMap<
  import('@playwright/test').Page,
  string[]
>();

const getEditor = (page: import('@playwright/test').Page) =>
  page.locator('[data-slate-editor="true"]').first();

const getBrowserUndoHotkey = async (root: Locator) =>
  root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta+Z' : 'Control+Z'
    );

const MENTIONS_FIREFOX_SELECT_ALL_DIAGNOSTIC =
  process.env.SLATE_MENTIONS_FIREFOX_SELECT_ALL_DIAGNOSTIC === '1';

const parseSlateFragmentFromHtml = (html: string | null) => {
  if (!html) {
    throw new Error('Missing text/html clipboard payload');
  }

  const match = html.match(/data-slate-fragment=(["'])(.*?)\1/);

  if (!match) {
    throw new Error('Missing Slate fragment in text/html clipboard payload');
  }

  const decoded = Buffer.from(match[2], 'base64').toString('utf8');

  try {
    return JSON.parse(decodeURIComponent(decoded));
  } catch {
    return JSON.parse(decoded);
  }
};

const selectMentionInsertionPoint = async (
  page: import('@playwright/test').Page
) => {
  await getEditor(page).evaluate((element: HTMLElement) => {
    const point = {
      path: [1, 0],
      offset: 'Try mentioning characters, like '.length,
    };
    const handle = (element as Record<string, any>).__slateBrowserHandle;

    if (!handle?.selectRange) {
      throw new Error('Missing Slate browser handle');
    }

    handle.selectRange({
      anchor: point,
      focus: point,
    });

    const textElement = element.querySelector(
      `[data-slate-node="text"][data-slate-path="${point.path.join(',')}"]`
    );
    const stringElement = textElement?.querySelector(
      '[data-slate-string], [data-slate-zero-width]'
    );
    const textNode = Array.from(stringElement?.childNodes ?? []).find(
      (node) => node.nodeType === Node.TEXT_NODE
    );

    if (!textNode) {
      throw new Error('Missing mention insertion DOM text node');
    }

    const offset = Math.min(point.offset, textNode.textContent?.length ?? 0);
    const selection = element.ownerDocument.getSelection();

    if (!selection) {
      throw new Error('Cannot access DOM selection');
    }

    selection.removeAllRanges();
    selection.setBaseAndExtent(textNode, offset, textNode, offset);
    element.focus();
    element.ownerDocument.dispatchEvent(
      new Event('selectionchange', { bubbles: true })
    );
  });
};

const commitDOMComposition = async (
  editor: Awaited<ReturnType<typeof openExample>>,
  {
    committedText,
    steps,
  }: {
    committedText: string;
    steps: string[];
  }
) =>
  editor.root.evaluate(
    (
      element: HTMLElement,
      { committedText, steps }: { committedText: string; steps: string[] }
    ) => {
      const selection = element.ownerDocument.getSelection();

      if (!selection || selection.rangeCount === 0) {
        throw new Error('Cannot compose without a DOM selection');
      }

      const insertionRange = selection.getRangeAt(0).cloneRange();
      const dispatchCompositionEvent = (
        type: 'compositionstart' | 'compositionupdate' | 'compositionend',
        data: string
      ) => {
        element.dispatchEvent(
          new CompositionEvent(type, {
            bubbles: true,
            cancelable: true,
            data,
          })
        );
      };

      dispatchCompositionEvent('compositionstart', steps[0] ?? '');
      steps.forEach((text) => {
        dispatchCompositionEvent('compositionupdate', text);
      });

      insertionRange.deleteContents();
      const composedNode = element.ownerDocument.createTextNode(committedText);
      insertionRange.insertNode(composedNode);
      insertionRange.setStart(composedNode, committedText.length);
      insertionRange.setEnd(composedNode, committedText.length);
      selection.removeAllRanges();
      selection.addRange(insertionRange);

      dispatchCompositionEvent('compositionend', committedText);
      element.ownerDocument.dispatchEvent(
        new Event('selectionchange', { bubbles: true })
      );
    },
    { committedText, steps }
  );

test.describe('mentions example', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    slateCoverageErrors.set(page, errors);
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        message.text().includes('without a DOM coverage boundary')
      ) {
        errors.push(message.text());
      }
    });
    await installSlateReactRenderProfiler(page);
    await page.goto('/examples/slate/mentions');
  });

  test('renders mention element', async ({ page }) => {
    await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1);
    await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(1);
    await page.waitForTimeout(50);
    expect(slateCoverageErrors.get(page)).toEqual([]);
  });

  test('keyboard undo restores select-all replacement content', async ({
    page,
  }, testInfo) => {
    if (MENTIONS_FIREFOX_SELECT_ALL_DIAGNOSTIC) {
      test.setTimeout(60_000);
    }
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop select-all undo repro'
    );
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'slate/mentions', {
      ready: {
        editor: 'visible',
      },
    });
    const originalModelText = await editor.get.modelText();
    const captureDiagnostic = async (label: string) => ({
      bodyText: await page
        .locator('body')
        .innerText()
        .catch((error) => `body unavailable: ${String(error)}`),
      domSelection: await editor.selection
        .dom()
        .catch((error) => `dom selection unavailable: ${String(error)}`),
      kernelTrace: (await editor.get.kernelTrace().catch(() => [])).slice(-12),
      label,
      lastCommit: await editor.get
        .lastCommit()
        .catch((error) => `last commit unavailable: ${String(error)}`),
      modelSelection: await editor.selection
        .get()
        .catch((error) => `model selection unavailable: ${String(error)}`),
      modelText: await editor.get
        .modelText()
        .catch((error) => `model text unavailable: ${String(error)}`),
      runtimeErrors: runtimeErrors.errors,
      windowSelection: await page
        .evaluate(() => {
          const selection = window.getSelection();

          if (!selection) {
            return null;
          }

          return {
            anchorNodeText: selection.anchorNode?.textContent ?? null,
            anchorOffset: selection.anchorOffset,
            focusNodeText: selection.focusNode?.textContent ?? null,
            focusOffset: selection.focusOffset,
            rangeCount: selection.rangeCount,
            text: selection.toString(),
          };
        })
        .catch((error) => `window selection unavailable: ${String(error)}`),
    });

    try {
      if (MENTIONS_FIREFOX_SELECT_ALL_DIAGNOSTIC) {
        await attachSlateBrowserJsonArtifact(
          testInfo,
          'mentions-firefox-select-all-before',
          await captureDiagnostic('before-select-all')
        );
      }

      await editor.selection.selectAll();

      if (MENTIONS_FIREFOX_SELECT_ALL_DIAGNOSTIC) {
        await attachSlateBrowserJsonArtifact(
          testInfo,
          'mentions-firefox-select-all-after-select-all',
          await captureDiagnostic('after-select-all')
        );
      }

      await editor.root.press('Z');
      if (MENTIONS_FIREFOX_SELECT_ALL_DIAGNOSTIC) {
        await page.waitForTimeout(500);
        await attachSlateBrowserJsonArtifact(
          testInfo,
          'mentions-firefox-select-all-after-insert',
          await captureDiagnostic('after-insert')
        );
        const errorBoundaryCount = await page
          .getByText('An error was thrown by one of the example')
          .count()
          .catch(() => 0);

        if (errorBoundaryCount > 0) {
          throw new Error(
            'Firefox select-all replacement crashed the mentions route'
          );
        }
      }
      await editor.assert.text('Z');

      await editor.root.press(await getBrowserUndoHotkey(editor.root));

      await expect.poll(() => editor.get.modelText()).toBe(originalModelText);
      await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1);
      await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(
        1
      );
      runtimeErrors.assertNone();
    } catch (error) {
      if (MENTIONS_FIREFOX_SELECT_ALL_DIAGNOSTIC) {
        await attachSlateBrowserJsonArtifact(
          testInfo,
          'mentions-firefox-select-all-failure',
          {
            ...(await captureDiagnostic('failure')),
            error: error instanceof Error ? error.stack : String(error),
          }
        );
      }
      throw error;
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps a mention atomic when CJK composition starts after it', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME atom proof');

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/mentions', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.collapse({ path: [1, 2], offset: 0 });
      await editor.focus();
      await commitDOMComposition(editor, {
        committedText: '你',
        steps: ['n', 'ni', '你'],
      });

      await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1);
      await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(
        1
      );
      await expect
        .poll(async () => (await editor.get.blockTexts())[1])
        .toContain('R2-D2你');
      expect(((await editor.get.modelText()).match(/你/g) ?? []).length).toBe(
        1
      );
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('copies and pastes a selected mention without crashing', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard repro');
    test.skip(
      testInfo.project.name === 'webkit',
      'WebKit blocks privileged clipboard reads in Playwright'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/mentions', {
        ready: {
          editor: 'visible',
        },
      });

      await page.locator('[data-cy="mention-R2-D2"]').click();
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 1, 0], offset: 0 },
          focus: { path: [1, 1, 0], offset: 0 },
        });

      const payload = await editor.clipboard.copyPayload();

      expect(payload.html).toContain('data-slate-fragment=');

      await editor.selection.collapse({ path: [1, 2], offset: 4 });
      await editor.focus();
      await editor.root.press('ControlOrMeta+V');

      await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(2);
      await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(
        1
      );
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('copies and repeatedly pastes a selected mention as separate atoms', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard repro');
    test.skip(
      testInfo.project.name === 'webkit',
      'WebKit blocks privileged clipboard reads in Playwright'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/mentions', {
        ready: {
          editor: 'visible',
        },
      });

      await page.locator('[data-cy="mention-R2-D2"]').click();
      await editor.assert.selection({
        anchor: { path: [1, 1, 0], offset: 0 },
        focus: { path: [1, 1, 0], offset: 0 },
      });

      const payload = await editor.clipboard.copyPayload();

      expect(payload.html).toContain('data-slate-fragment=');
      expect(parseSlateFragmentFromHtml(payload.html)).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              type: 'mention',
              character: 'R2-D2',
              children: [{ text: '', bold: true }],
            },
          ],
        },
      ]);

      await editor.selection.collapse({ path: [1, 2], offset: 4 });
      await editor.focus();

      for (let i = 0; i < 3; i += 1) {
        await editor.root.press('ControlOrMeta+V');
      }

      await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(4);
      await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(
        1
      );
      expect(
        await editor.root
          .locator('[data-cy="mention-R2-D2"]')
          .evaluateAll((nodes) => nodes.map((node) => node.textContent))
      ).toEqual(['@R2-D2', '@R2-D2', '@R2-D2', '@R2-D2']);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('copies selected mention to deterministic browser clipboard payload', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium privileged clipboard payload proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/mentions', {
        ready: {
          editor: 'visible',
        },
      });

      await page.locator('[data-cy="mention-R2-D2"]').click();
      await editor.assert.selection({
        anchor: { path: [1, 1, 0], offset: 0 },
        focus: { path: [1, 1, 0], offset: 0 },
      });

      const payload = await editor.clipboard.copyPayload();

      expect(payload.types).toEqual(
        expect.arrayContaining(['text/html', 'text/plain'])
      );
      expect(payload.html).toContain('data-slate-fragment=');
      expect(payload.html).toContain('@R2-D2');
      expect(payload.html).not.toContain('\uFEFF');
      expect(payload.html).not.toContain('Try mentioning characters');
      expect(payload.html).not.toContain('Mace Windu');
      expect(payload.text).toBe('@R2-D2');
      expect(payload.text).not.toContain('\uFEFF');

      const fragment = parseSlateFragmentFromHtml(payload.html);

      expect(fragment).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              type: 'mention',
              character: 'R2-D2',
              children: [{ text: '', bold: true }],
            },
          ],
        },
      ]);

      const externalTarget = page.locator('[data-cy="external-paste-target"]');

      await page.evaluate(() => {
        const target = document.createElement('div');

        target.contentEditable = 'true';
        target.setAttribute('data-cy', 'external-paste-target');
        target.style.position = 'fixed';
        target.style.left = '8px';
        target.style.bottom = '8px';
        document.body.appendChild(target);
      });
      await externalTarget.focus();
      await page.keyboard.press('ControlOrMeta+V');

      await expect(externalTarget).toContainText('@R2-D2');
      await expect(
        editor.root.locator('[data-cy="mention-R2-D2"]')
      ).toHaveCount(1);
      await expect(
        editor.root.locator('[data-cy="mention-Mace-Windu"]')
      ).toHaveCount(1);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('cuts a selected mention without crashing', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard repro');

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/mentions', {
        ready: {
          editor: 'visible',
        },
      });
      const beforeFirstMentionText = 'Try mentioning characters, like ';

      await page.locator('[data-cy="mention-R2-D2"]').click();
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 1, 0], offset: 0 },
          focus: { path: [1, 1, 0], offset: 0 },
        });

      await editor.root.press('ControlOrMeta+X');

      await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(0);
      await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(
        1
      );
      await editor.assert.selection({
        anchor: { path: [1, 0], offset: beforeFirstMentionText.length },
        focus: { path: [1, 0], offset: beforeFirstMentionText.length },
      });
      await editor.assert.kernelTrace({
        commandKind: 'delete-fragment',
        eventFamily: 'cut',
        ownership: 'model-owned',
        transition: { allowed: true },
      });
      const lastCommit = (await editor.get.lastCommit()) as {
        command?: { kind?: string } | null;
        operations?: Array<{
          newProperties?: unknown;
          node?: unknown;
          path?: number[];
          properties?: unknown;
          root?: string;
          type?: string;
        }>;
      } | null;

      expect(
        lastCommit?.operations?.filter((op) => op.type === 'remove_node')
      ).toEqual([
        {
          type: 'remove_node',
          path: [1, 1],
          node: {
            type: 'mention',
            character: 'R2-D2',
            children: [{ text: '', bold: true }],
          },
        },
      ]);
      expect(
        lastCommit?.operations?.some((op) => op.type === 'set_selection')
      ).toBe(true);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('shows list of mentions', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop mention portal proof'
    );

    await getEditor(page).click();
    await selectMentionInsertionPoint(page);
    await getEditor(page).pressSequentially(' @ma');
    await expect(page.locator('[data-cy="mentions-portal"]')).toHaveCount(1);
  });

  test('keeps mention portal closed for plain text without trigger', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop mention portal proof'
    );

    await getEditor(page).click();
    await selectMentionInsertionPoint(page);
    await getEditor(page).pressSequentially(' Kar');

    await expect(page.locator('[data-cy="mentions-portal"]')).toHaveCount(0);
  });

  test('inserts from list', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop mention portal proof'
    );

    await getEditor(page).click();
    await selectMentionInsertionPoint(page);
    await getEditor(page).pressSequentially(' @Ja');
    await expect(page.locator('[data-cy="mentions-portal"]')).toHaveCount(1);
    await getEditor(page).press('Enter');
    await expect(page.locator('[data-cy="mention-Jabba"]')).toHaveCount(1);
  });

  test('keeps mention portal open during IME composition', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium CDP IME proof');

    await getEditor(page).click();
    await selectMentionInsertionPoint(page);
    await getEditor(page).pressSequentially(' @ma');

    const portal = page.locator('[data-cy="mentions-portal"]');

    await expect(portal).toHaveCount(1);

    const client = await page.context().newCDPSession(page);

    await client.send('Input.imeSetComposition', {
      selectionEnd: 1,
      selectionStart: 1,
      text: 'す',
    });
    await expect(portal).toHaveCount(1);

    await client.send('Input.imeSetComposition', {
      selectionEnd: 2,
      selectionStart: 2,
      text: 'すし',
    });
    await expect(portal).toHaveCount(1);

    await client.send('Input.imeSetComposition', {
      selectionEnd: 0,
      selectionStart: 0,
      text: '',
    });
  });

  test('commits staged IME composition before a markable inline mention', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium CDP IME proof');

    const editor = await openExample(page, 'slate/mentions', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeFirstMentionText = 'Try mentioning characters, like ';
    const insertedText = 'すし';
    const insertedOffset = beforeFirstMentionText.length + insertedText.length;

    await selectMentionInsertionPoint(page);
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: beforeFirstMentionText.length },
      focus: { path: [1, 0], offset: beforeFirstMentionText.length },
    });

    await editor.ime.compose({
      committedText: insertedText,
      steps: ['ｓ', 'す', 'すｓ', 'すｓｈ', insertedText],
      text: insertedText,
      transport: 'native',
    });

    await editor.assert.text(`${beforeFirstMentionText}${insertedText}`);
    await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1);
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: insertedOffset },
      focus: { path: [1, 0], offset: insertedOffset },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('commits IME composition between inline mentions without overwriting them', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

    const editor = await openExample(page, 'slate/mentions', {
      ready: {
        editor: 'visible',
      },
    });
    const betweenMentionsPoint = { path: [1, 2], offset: 2 };

    await editor.selection.selectDOM({
      anchor: betweenMentionsPoint,
      focus: betweenMentionsPoint,
    });
    await editor.assert.selection({
      anchor: betweenMentionsPoint,
      focus: betweenMentionsPoint,
    });
    await editor.assert.domSelection({
      anchorNodeText: ' or ',
      anchorOffset: 2,
      focusNodeText: ' or ',
      focusOffset: 2,
    });

    await commitDOMComposition(editor, {
      committedText: 'すし',
      steps: ['す', 'すし'],
    });

    await expect
      .poll(() => editor.get.modelText())
      .toContain('Try mentioning characters, like  oすしr !');
    await editor.assert.text(' oすしr ');
    await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1);
    await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(1);
    await editor.assert.selection({
      anchor: { path: [1, 2], offset: 4 },
      focus: { path: [1, 2], offset: 4 },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('commits IME composition immediately after an inline mention', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

    const editor = await openExample(page, 'slate/mentions', {
      ready: {
        editor: 'visible',
      },
    });
    const afterFirstMentionPoint = { path: [1, 2], offset: 0 };

    await editor.selection.selectDOM({
      anchor: afterFirstMentionPoint,
      focus: afterFirstMentionPoint,
    });
    await editor.assert.selection({
      anchor: afterFirstMentionPoint,
      focus: afterFirstMentionPoint,
    });
    await editor.assert.domSelection({
      anchorNodeText: ' or ',
      anchorOffset: 0,
      focusNodeText: ' or ',
      focusOffset: 0,
    });

    await commitDOMComposition(editor, {
      committedText: 'すし',
      steps: ['す', 'すし'],
    });

    await editor.assert.text('すし or ');
    await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1);
    await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(1);
    await editor.assert.selection({
      anchor: { path: [1, 2], offset: 2 },
      focus: { path: [1, 2], offset: 2 },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('arrow keys select mentions atomically from both sides', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop mention keyboard proof'
    );

    const editor = await openExample(page, 'slate/mentions', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeFirstMentionText = 'Try mentioning characters, like ';
    const betweenMentionsText = ' or ';

    await editor.selection.collapse({
      path: [1, 0],
      offset: beforeFirstMentionText.length,
    });
    await editor.focus();
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: beforeFirstMentionText.length },
      focus: { path: [1, 0], offset: beforeFirstMentionText.length },
    });
    await resetSlateReactRenderProfiler(page);
    await editor.root.press('ArrowRight');
    await editor.assert.selection({
      anchor: { path: [1, 1, 0], offset: 0 },
      focus: { path: [1, 1, 0], offset: 0 },
    });
    let proof = await takeSlateBrowserRenderStateSnapshot(editor);

    expect(proof.selection).toEqual({
      anchor: { path: [1, 1, 0], offset: 0 },
      focus: { path: [1, 1, 0], offset: 0 },
    });
    expect(proof.domSelection?.anchorOffset).toBe(1);
    expect(proof.focusOwner.kind).toBe('editor');
    expect(proof.selectionShells?.anchor.node?.path).toBe('1,1,0');
    expect(proof.selectionShells?.anchor.node?.runtimeId).toBeTruthy();
    expect(proof.selectionShells?.anchor.element?.path).toBe('1,1');
    expect(proof.selectionShells?.anchor.element?.isVoid).toBe(true);
    await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCSS(
      'box-shadow',
      'rgb(180, 213, 255) 0px 0px 0px 2px'
    );

    await editor.selection.collapse({ path: [1, 2], offset: 0 });
    await editor.assert.selection({
      anchor: { path: [1, 2], offset: 0 },
      focus: { path: [1, 2], offset: 0 },
    });
    await resetSlateReactRenderProfiler(page);
    await editor.root.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { path: [1, 1, 0], offset: 0 },
      focus: { path: [1, 1, 0], offset: 0 },
    });
    proof = await takeSlateBrowserRenderStateSnapshot(editor);

    expect(proof.selection).toEqual({
      anchor: { path: [1, 1, 0], offset: 0 },
      focus: { path: [1, 1, 0], offset: 0 },
    });
    expect(proof.selectionShells?.anchor.node?.path).toBe('1,1,0');
    expect(proof.selectionShells?.anchor.element?.path).toBe('1,1');
    expect(proof.selectionShells?.anchor.element?.isVoid).toBe(true);

    await editor.selection.collapse({
      path: [1, 2],
      offset: betweenMentionsText.length,
    });
    await editor.assert.selection({
      anchor: { path: [1, 2], offset: betweenMentionsText.length },
      focus: { path: [1, 2], offset: betweenMentionsText.length },
    });
    await resetSlateReactRenderProfiler(page);
    await editor.root.press('ArrowRight');
    await editor.assert.selection({
      anchor: { path: [1, 3, 0], offset: 0 },
      focus: { path: [1, 3, 0], offset: 0 },
    });
    proof = await takeSlateBrowserRenderStateSnapshot(editor);

    expect(proof.selection).toEqual({
      anchor: { path: [1, 3, 0], offset: 0 },
      focus: { path: [1, 3, 0], offset: 0 },
    });
    expect(proof.domSelection?.anchorOffset).toBe(1);
    expect(proof.selectionShells?.anchor.node?.path).toBe('1,3,0');
    expect(proof.selectionShells?.anchor.node?.runtimeId).toBeTruthy();
    expect(proof.selectionShells?.anchor.element?.path).toBe('1,3');
    expect(proof.selectionShells?.anchor.element?.isVoid).toBe(true);
    await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCSS(
      'box-shadow',
      'rgb(180, 213, 255) 0px 0px 0px 2px'
    );

    await editor.selection.collapse({ path: [1, 4], offset: 0 });
    await editor.assert.selection({
      anchor: { path: [1, 4], offset: 0 },
      focus: { path: [1, 4], offset: 0 },
    });
    await resetSlateReactRenderProfiler(page);
    await editor.root.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { path: [1, 3, 0], offset: 0 },
      focus: { path: [1, 3, 0], offset: 0 },
    });
    proof = await takeSlateBrowserRenderStateSnapshot(editor);

    expect(proof.selection).toEqual({
      anchor: { path: [1, 3, 0], offset: 0 },
      focus: { path: [1, 3, 0], offset: 0 },
    });
    expect(proof.selectionShells?.anchor.node?.path).toBe('1,3,0');
    expect(proof.selectionShells?.anchor.element?.path).toBe('1,3');
    expect(proof.selectionShells?.anchor.element?.isVoid).toBe(true);
  });

  test('Backspace after typing between adjacent inline mentions removes typed text only', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop mention editing proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/mentions', {
        ready: {
          editor: 'visible',
        },
      });
      const betweenMentionsText = ' or ';

      await editor.selection.select({
        anchor: { path: [1, 2], offset: 0 },
        focus: { path: [1, 2], offset: betweenMentionsText.length },
      });
      await editor.deleteFragment();
      await editor.selection.collapse({ path: [1, 2], offset: 0 });
      await editor.focus();
      await page.keyboard.type('x');
      await editor.root.press('Backspace');

      runtimeErrors.assertNone();
      await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1);
      await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(
        1
      );
      await expect
        .poll(async () =>
          (await editor.get.blockTexts())[1]?.replaceAll('\u00A0', '')
        )
        .toContain('@R2-D2@Mace Windu');
      await expect
        .poll(async () =>
          (await editor.get.blockTexts())[1]?.replaceAll('\u00A0', '')
        )
        .not.toContain('@R2-D2x@Mace Windu');
      await editor.assert.selection({
        anchor: { path: [1, 2], offset: 0 },
        focus: { path: [1, 2], offset: 0 },
      });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('selects the last character after a leading inline mention and space', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop mention selection proof'
    );

    const editor = await openExample(page, 'slate/mentions', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeFirstMentionText = 'Try mentioning characters, like ';

    await editor.selection.select({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: beforeFirstMentionText.length },
    });
    await editor.deleteFragment();

    const blockText = (await editor.get.blockTexts())[1]?.replaceAll(
      '\u00A0',
      ' '
    );

    expect(blockText).toContain('@R2-D2 or @Mace Windu!');
    const lastText = editor.root
      .locator('[data-slate-node="text"][data-slate-path="1,4"]')
      .locator('[data-slate-string]')
      .first();
    const lastTextRect = await lastText.boundingBox();

    if (!lastTextRect) {
      throw new Error('Missing final mention paragraph text box');
    }

    await page.mouse.move(
      lastTextRect.x + lastTextRect.width + 2,
      lastTextRect.y + lastTextRect.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      lastTextRect.x + 1,
      lastTextRect.y + lastTextRect.height / 2,
      { steps: 4 }
    );
    await page.mouse.up();

    await expect
      .poll(async () =>
        (await editor.get.selectedText()).replaceAll('\u00A0', ' ')
      )
      .toBe('!');
  });

  test('drag-selects across leading inline mentions atomically', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop inline void drag-selection proof'
    );
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/mentions', {
        ready: {
          editor: 'visible',
        },
      });
      const beforeFirstMentionText = 'Try mentioning characters, like ';

      await editor.selection.select({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: beforeFirstMentionText.length },
      });
      await editor.deleteFragment();

      const firstMention = page.locator('[data-cy="mention-R2-D2"]').first();
      const secondMention = page
        .locator('[data-cy="mention-Mace-Windu"]')
        .first();
      const lastText = editor.root
        .locator('[data-slate-node="text"][data-slate-path="1,4"]')
        .locator('[data-slate-string]')
        .first();
      const firstBox = await firstMention.boundingBox();
      const secondBox = await secondMention.boundingBox();
      const lastTextBox = await lastText.boundingBox();

      if (!firstBox || !secondBox || !lastTextBox) {
        throw new Error('Missing mention boxes for leading inline drag proof');
      }

      const y = firstBox.y + firstBox.height / 2;

      await page.mouse.move(lastTextBox.x + 1, y);
      await page.mouse.down();
      await page.mouse.move(firstBox.x - 2, y, {
        steps: 12,
      });
      await page.mouse.up();

      runtimeErrors.assertNone();
      await expect
        .poll(async () =>
          (await editor.get.selectedText()).replaceAll('\u00A0', ' ')
        )
        .toBe('@R2-D2 or @Mace Windu');
      await editor.assert.noDoubleSelectionHighlight();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('shows a drop cursor when dragging over an inline mention void', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop dragover visual proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/mentions', {
        ready: {
          editor: 'visible',
        },
      });

      await page.waitForLoadState('networkidle');
      await expect(
        page.locator('[data-cy="mention-R2-D2"]').first()
      ).toBeVisible();
      await expect
        .poll(() => editor.get.modelText())
        .toContain('Try mentioning characters, like  or !');

      const mention = page.locator('[data-cy="mention-R2-D2"]').first();
      const cursor = editor.root.locator('[data-slate-drop-cursor]');
      const dispatchMentionDrag = async (horizontalEdge: 'left' | 'right') =>
        mention.evaluate((element, edge) => {
          const rect = element.getBoundingClientRect();
          const data = new DataTransfer();
          const clientX = edge === 'left' ? rect.left + 1 : rect.right - 1;

          data.setData('text/plain', 'dragged text');
          element.dispatchEvent(
            new DragEvent('dragover', {
              bubbles: true,
              cancelable: true,
              clientX,
              clientY: rect.top + rect.height / 2,
              dataTransfer: data,
            })
          );
        }, horizontalEdge);

      await dispatchMentionDrag('left');
      await expect(cursor).toBeVisible();

      const leftCursorBox = await cursor.boundingBox();
      const voidBox = await mention.evaluate((element) => {
        const rect = element
          .closest('[data-slate-node][data-slate-void="true"]')
          ?.getBoundingClientRect();

        if (!rect) {
          return null;
        }

        return {
          height: rect.height,
          width: rect.width,
          x: rect.x,
          y: rect.y,
        };
      });

      if (!leftCursorBox || !voidBox) {
        throw new Error('Expected inline mention drop cursor and void boxes');
      }

      expect(leftCursorBox.x).toBeLessThan(voidBox.x + 3);
      expect(leftCursorBox.height).toBeGreaterThan(voidBox.height * 0.8);

      await dispatchMentionDrag('right');

      const rightCursorBox = await cursor.boundingBox();

      if (!rightCursorBox) {
        throw new Error(
          'Expected inline mention drop cursor after right dragover'
        );
      }

      expect(rightCursorBox.x).toBeGreaterThan(voidBox.x + voidBox.width - 3);
      expect(rightCursorBox.height).toBeGreaterThan(voidBox.height * 0.8);

      await mention.evaluate((element) => {
        element.dispatchEvent(
          new DragEvent('dragend', {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });

      await expect(cursor).toHaveCount(0);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('typing two spaces after an inline mention does not insert a dot', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop mention text input proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/mentions', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.collapse({ path: [1, 2], offset: 0 });
      await editor.focus();
      await editor.root.press('Space');
      await editor.root.press('Space');

      await expect
        .poll(async () =>
          (await editor.get.blockTexts())[1]?.replaceAll('\u00A0', ' ')
        )
        .toContain('R2-D2   or');
      await expect
        .poll(async () =>
          (await editor.get.blockTexts())[1]?.replaceAll('\u00A0', ' ')
        )
        .not.toContain('R2-D2.');
      await editor.assert.selection({
        anchor: { path: [1, 2], offset: 2 },
        focus: { path: [1, 2], offset: 2 },
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('moves to line boundaries across mentions with Slate-owned hotkeys', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop keyboard movement proof'
    );

    const editor = await openExample(page, 'slate/mentions', {
      ready: {
        editor: 'visible',
      },
    });
    const isMacBrowser = await page.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent)
    );
    const lineStartHotkey = isMacBrowser ? 'Control+A' : 'Home';
    const lineEndHotkey = isMacBrowser ? 'Control+E' : 'End';
    const betweenMentionsText = ' or ';

    await editor.selection.collapse({
      path: [1, 2],
      offset: Math.floor(betweenMentionsText.length / 2),
    });
    await editor.focus();

    await editor.root.press(lineStartHotkey);
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });

    await editor.root.press(lineEndHotkey);
    await editor.assert.selection({
      anchor: { path: [1, 4], offset: 1 },
      focus: { path: [1, 4], offset: 1 },
    });
  });

  test('preserves a leading mention when Backspace removes its line boundary', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop mention editing proof'
    );

    const editor = await openExample(page, 'slate/mentions', {
      ready: {
        editor: 'visible',
      },
    });
    const beforeFirstMentionText = 'Try mentioning characters, like ';
    const boundaryPoint = {
      path: [1, 0],
      offset: beforeFirstMentionText.length,
    };

    await editor.selection.collapse(boundaryPoint);
    await editor.focus();
    await editor.assert.selection({
      anchor: boundaryPoint,
      focus: boundaryPoint,
    });

    await editor.root.press('Enter');
    await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1);
    await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(1);

    await editor.root.press('Backspace');

    await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1);
    await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(1);
    await editor.assert.selection({
      anchor: boundaryPoint,
      focus: boundaryPoint,
    });
    await expect
      .poll(() => editor.get.modelText())
      .toContain('Try mentioning characters, like  or !');
  });

  test('preserves mention order when Backspace removes a line boundary before them', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop mention editing proof'
    );

    const editor = await openExample(page, 'slate/mentions', {
      ready: {
        editor: 'visible',
      },
    });
    const boundaryPoint = {
      path: [1, 0],
      offset: 'Try mentioning characters, like '.length,
    };

    await editor.selection.collapse(boundaryPoint);
    await editor.focus();
    await editor.root.press('Enter');
    await editor.root.press('Backspace');

    await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1);
    await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(1);
    expect(
      await editor.root
        .locator('[data-cy^="mention-"]')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute('data-cy'))
        )
    ).toEqual(['mention-R2-D2', 'mention-Mace-Windu']);
    await editor.assert.selection({
      anchor: boundaryPoint,
      focus: boundaryPoint,
    });
  });
});
