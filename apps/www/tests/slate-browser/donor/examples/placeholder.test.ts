import { expect, type Locator, test } from '@playwright/test';
import {
  openExample,
  recordSlateBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

const getBrowserUndoHotkey = async (root: Locator) =>
  root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta+Z' : 'Control+Z'
    );

test.describe('placeholder example', () => {
  test.beforeEach(
    async ({ page }) => await page.goto('/examples/slate/custom-placeholder')
  );

  test('renders custom placeholder', async ({ page }) => {
    const placeholderElement = page.locator('[data-slate-placeholder=true]');

    await expect(placeholderElement).toContainText('Type something');
    await expect(page.locator('pre')).toContainText('renderPlaceholder');
  });

  test('keeps an empty editor value and start selection while showing a placeholder', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/custom-placeholder', {
      ready: {
        editor: 'visible',
        placeholder: 'visible',
      },
    });

    await editor.focus();

    await editor.assert.placeholderVisible(true);
    await expect.poll(() => editor.get.modelText()).toBe('');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  test('excludes placeholder text from native selected text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop native selection proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/custom-placeholder', {
        ready: {
          editor: 'visible',
          placeholder: 'visible',
        },
      });

      await editor.focus();
      await page.keyboard.press('ControlOrMeta+A');

      await expect
        .poll(async () => {
          const nativeSelectedText = await page.evaluate(
            () => window.getSelection()?.toString() ?? ''
          );

          return {
            hasPlaceholderText:
              nativeSelectedText.includes('Type something') ||
              nativeSelectedText.includes(
                'Use the renderPlaceholder prop to customize rendering of the placeholder'
              ),
            normalizedSelectedText: nativeSelectedText.replace(/\n/g, ''),
          };
        })
        .toEqual({
          hasPlaceholderText: false,
          normalizedSelectedText: '',
        });
      await expect
        .poll(async () => {
          const selectedText = await editor.get.selectedText();

          return {
            hasPlaceholderText:
              selectedText.includes('Type something') ||
              selectedText.includes(
                'Use the renderPlaceholder prop to customize rendering of the placeholder'
              ),
            normalizedSelectedText: selectedText.replace(/\n/g, ''),
          };
        })
        .toEqual({
          hasPlaceholderText: false,
          normalizedSelectedText: '',
        });
      await editor.assert.placeholderVisible(true);
      await expect.poll(() => editor.get.modelText()).toBe('');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('renders editor tall enough to fit placeholder', async ({ page }) => {
    const slateEditor = page.locator('[data-slate-editor=true]');
    const placeholderElement = page.locator('[data-slate-placeholder=true]');

    await expect(placeholderElement).toBeVisible();

    const editorBoundingBox = await slateEditor.boundingBox();
    const placeholderBoundingBox = await placeholderElement.boundingBox();

    if (!editorBoundingBox)
      throw new Error('Could not get bounding box for editor');
    if (!placeholderBoundingBox)
      throw new Error('Could not get bounding box for placeholder');

    expect(editorBoundingBox.height).toBeGreaterThanOrEqual(
      placeholderBoundingBox.height
    );
  });

  test('commits IME composition from the custom placeholder empty state', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

    const editor = await openExample(page, 'slate/custom-placeholder', {
      ready: {
        editor: 'visible',
        placeholder: 'visible',
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await editor.ime.compose({
      committedText: 'abc',
      steps: ['a', 'ab', 'abc'],
      text: 'abc',
      transport: 'native',
    });

    await editor.assert.text('abc');
    await expect.poll(() => editor.get.modelText()).toBe('abc');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 'abc'.length },
      focus: { path: [0, 0], offset: 'abc'.length },
    });
    await editor.assert.placeholderVisible(false);
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('commits dictation-style insertText beforeinput from the custom placeholder empty state', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox lacks compatible synthetic beforeinput dispatch'
    );
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop synthetic beforeinput placeholder proof'
    );

    const editor = await openExample(page, 'slate/custom-placeholder', {
      ready: {
        editor: 'visible',
        placeholder: 'visible',
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await editor.root.evaluate((element: HTMLElement) => {
      const event = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: 'dictated text',
        inputType: 'insertText',
      });

      element.dispatchEvent(event);
    });

    await editor.assert.text('dictated text');
    await expect.poll(() => editor.get.modelText()).toBe('dictated text');
    await editor.assert.placeholderVisible(false);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 'dictated text'.length },
      focus: { path: [0, 0], offset: 'dictated text'.length },
    });
  });

  test('fires blur when focus leaves during placeholder IME composition', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium CDP IME proof');

    const editor = await openExample(page, 'slate/custom-placeholder', {
      ready: {
        editor: 'visible',
        placeholder: 'visible',
      },
    });

    await editor.root.evaluate((element: HTMLElement) => {
      element.dataset.blurCount = '0';
      element.addEventListener('blur', () => {
        element.dataset.blurCount = String(
          Number(element.dataset.blurCount ?? '0') + 1
        );
      });
    });

    await page.evaluate(() => {
      document.getElementById('composition-blur-target')?.remove();

      const button = document.createElement('button');
      button.id = 'composition-blur-target';
      button.type = 'button';
      button.textContent = 'outside';
      document.body.append(button);
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await editor.ime.enableKeyEvents();

    const client = await page.context().newCDPSession(page);
    await client.send('Input.imeSetComposition', {
      selectionEnd: 1,
      selectionStart: 1,
      text: 'す',
    });

    const blurTarget = page.locator('#composition-blur-target');
    await blurTarget.focus();

    await expect(blurTarget).toBeFocused();
    await expect
      .poll(() =>
        editor.root.evaluate((element: HTMLElement) =>
          Number(element.dataset.blurCount ?? '0')
        )
      )
      .toBe(1);
    await editor.assert.kernelTrace({
      eventFamily: 'blur',
      transition: { allowed: true },
    });
  });

  test('undoes typing from the custom placeholder empty state', async ({
    browserName,
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/custom-placeholder', {
      ready: {
        editor: 'visible',
        placeholder: 'visible',
      },
    });
    const needsSemanticTransport =
      browserName === 'webkit' || testInfo.project.name === 'mobile';

    if (needsSemanticTransport) {
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      await editor.insertText('Undo me');
    } else {
      await editor.type('Undo me');
    }

    await editor.assert.text('Undo me');
    await expect.poll(() => editor.get.modelText()).toBe('Undo me');
    await editor.assert.placeholderVisible(false);

    if (needsSemanticTransport) {
      await editor.undo();
    } else {
      await page.keyboard.press(await getBrowserUndoHotkey(editor.root));
    }

    await expect(editor.root).not.toContainText('Undo me');
    await expect.poll(() => editor.get.modelText()).toBe('');
    await editor.assert.placeholderVisible(true);
  });

  test('splits after native typing from the custom placeholder empty state', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop native input proof');

    const editor = await openExample(page, 'slate/custom-placeholder', {
      ready: {
        editor: 'visible',
        placeholder: 'visible',
      },
    });

    await editor.type('a');
    await page.waitForTimeout(80);
    await editor.type('b');
    await page.waitForTimeout(80);
    await editor.press('Enter');

    await editor.assert.blockTexts(['ab', '']);
    await expect.poll(() => editor.get.modelText()).toBe('ab');
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    await editor.assert.placeholderVisible(false);
  });
});
