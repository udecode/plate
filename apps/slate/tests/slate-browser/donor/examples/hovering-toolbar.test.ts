import { expect, type Page, test } from '@playwright/test';
import {
  createSlateBrowserEditorHarness,
  installSlateReactRenderProfiler,
  openExample,
  recordSlateBrowserRuntimeErrors,
  resetSlateReactRenderProfiler,
  takeSlateBrowserRenderStateSnapshot,
} from '@platejs/browser/playwright';

test.describe('hovering toolbar example', () => {
  test.beforeEach(async ({ page }) => {
    await installSlateReactRenderProfiler(page);
    await page.goto('/examples/slate/hovering-toolbar');
  });

  const hasExpandedModelSelection = async (page: Page) =>
    page.locator('[data-slate-editor]').evaluate((element) => {
      const selection = (element as any).__slateBrowserHandle?.getSelection?.();

      if (!selection) {
        return false;
      }

      return (
        selection.anchor.offset !== selection.focus.offset ||
        selection.anchor.path.join(',') !== selection.focus.path.join(',')
      );
    });

  const selectFirstTextRange = async (page: Page) => {
    const editor = createSlateBrowserEditorHarness(
      page,
      'hovering-toolbar',
      page.locator('[data-slate-editor="true"]')
    );

    await editor.selection.selectDOM({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 24, path: [0, 0] },
    });
  };

  test('hovering toolbar appears', async ({ page }) => {
    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '0');

    await selectFirstTextRange(page);
    await expect(page.getByTestId('menu')).toHaveCount(1);

    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '1');
    await expect(page.getByTestId('menu')).toHaveCSS(
      'background-color',
      'rgb(24, 24, 27)'
    );
    await expect(page.getByTestId('hovering-toolbar-button-bold')).toHaveCSS(
      'color',
      'rgb(255, 255, 255)'
    );
    await expect(page.getByTestId('menu').getByRole('button')).toHaveCount(3);
  });

  test('hovering toolbar buttons keep selection and apply marks on pointer down', async ({
    page,
  }) => {
    const selectedText = 'This example shows how y';

    await selectFirstTextRange(page);
    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '1');
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe(selectedText);
    await expect.poll(() => hasExpandedModelSelection(page)).toBe(true);

    await page.getByTestId('hovering-toolbar-button-underline').click();

    await expect.poll(() => hasExpandedModelSelection(page)).toBe(true);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe(selectedText);
    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-slate-editor] u')).toContainText(
      selectedText
    );
  });

  test('hovering toolbar appears after DOM selection', async ({ page }) => {
    const editor = createSlateBrowserEditorHarness(
      page,
      'hovering-toolbar',
      page.locator('[data-slate-editor="true"]')
    );

    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '0');

    await resetSlateReactRenderProfiler(page);
    await selectFirstTextRange(page);

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .not.toBe('');
    await expect.poll(() => hasExpandedModelSelection(page)).toBe(true);
    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '1');
    await expect(page.getByTestId('menu')).not.toHaveCSS('top', '-10000px');
    await expect(page.getByTestId('menu')).not.toHaveCSS('left', '-10000px');

    const proof = await takeSlateBrowserRenderStateSnapshot(editor);

    expect(proof.selection).not.toBeNull();
    expect(proof.focusOwner.kind).toBe('editor');
    expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(4);
    expect(proof.renderCounts.total).toBeLessThanOrEqual(4);
  });

  test('hovering toolbar disappears', async ({ page }) => {
    await selectFirstTextRange(page);
    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '1');
    await selectFirstTextRange(page);
    await page.locator('body').click({ force: true, position: { x: 0, y: 0 } });
    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '0');
  });

  test('typing English over selected formatted text does not crash', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop replacement text repro'
    );
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'slate/hovering-toolbar', {
      ready: {
        editor: 'visible',
        text: /This example shows/,
      },
    });

    try {
      await editor.selection.selectDOM({
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 4, path: [0, 1] },
      });
      await expect
        .poll(() =>
          page.evaluate(() => window.getSelection()?.toString() ?? '')
        )
        .toBe('bold');

      await page.keyboard.type('plain');

      runtimeErrors.assertNone();
      await expect(editor.root).toContainText('plain');
      await expect(
        editor.root.locator('strong', { hasText: 'bold' })
      ).toHaveCount(0);
    } finally {
      runtimeErrors.stop();
    }
  });

  test('native format beforeinput routes through the semantic command handler', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop native proof');

    const editor = await openExample(page, 'slate/hovering-toolbar', {
      ready: {
        editor: 'visible',
        text: /This example shows/,
      },
    });

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText('hello');
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });

    const prevented = await editor.root.evaluate((element) => {
      const event = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'formatBold',
      }) as InputEvent & { getTargetRanges: () => StaticRange[] };

      event.getTargetRanges = () => [];
      element.dispatchEvent(event);

      return event.defaultPrevented;
    });

    expect(prevented).toBe(true);
    await expect(editor.root.locator('strong')).toHaveText('hello');
  });

  test('keeps hovering toolbar hidden during IME composition', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium CDP IME proof');

    const editor = await openExample(page, 'slate/hovering-toolbar', {
      ready: {
        editor: 'visible',
        text: /This example shows/,
      },
    });

    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '0');

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await editor.ime.enableKeyEvents();

    const client = await page.context().newCDPSession(page);

    await client.send('Input.imeSetComposition', {
      selectionEnd: 1,
      selectionStart: 0,
      text: 'ｓ',
    });
    await client.send('Input.imeSetComposition', {
      selectionEnd: 1,
      selectionStart: 0,
      text: 'す',
    });
    await client.send('Input.imeSetComposition', {
      selectionEnd: 2,
      selectionStart: 0,
      text: 'すｓ',
    });
    await client.send('Input.imeSetComposition', {
      selectionEnd: 3,
      selectionStart: 0,
      text: 'すｓｈ',
    });

    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '0');

    await client.send('Input.insertText', { text: 'すし' });
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    });

    await expect(page.getByTestId('menu')).toHaveCSS('opacity', '1');
  });
});
