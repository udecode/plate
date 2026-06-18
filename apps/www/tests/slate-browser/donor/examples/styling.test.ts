import { expect, test } from '@playwright/test';
import { openExample } from '@platejs/browser/playwright';

test.describe('styling example', () => {
  test.beforeEach(
    async ({ page }) => await page.goto('/examples/slate/styling')
  );

  test('applies styles to editor from style prop', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    const editor = page.locator('[data-slate-editor=true]').nth(0);
    const styles = await editor.evaluate((el) => {
      const {
        backgroundColor,
        minHeight,
        outlineWidth,
        outlineStyle,
        outlineColor,
        position,
        whiteSpace,
        wordWrap,
      } = window.getComputedStyle(el);
      return {
        backgroundColor,
        minHeight,
        outlineWidth,
        outlineStyle,
        outlineColor,
        position,
        whiteSpace,
        wordWrap,
      };
    });

    // Provided styles
    expect(styles.backgroundColor).toBe('rgb(255, 230, 156)');
    expect(styles.minHeight).toBe('200px');
    expect(styles.outlineWidth).toBe('2px');
    expect(styles.outlineStyle).toBe('solid');
    expect(styles.outlineColor).toBe('rgb(0, 128, 0)');

    // Default styles
    expect(styles.position).toBe('relative');
    expect(styles.whiteSpace).toBe('pre-wrap');
    expect(styles.wordWrap).toBe('break-word');
  });

  test('applies styles to editor from className prop', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    const editor = page.locator('[data-slate-editor=true]').nth(1);
    const styles = await editor.evaluate((el) => {
      const {
        backgroundColor,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        fontSize,
        minHeight,
        outlineWidth,
        outlineStyle,
        outlineColor,
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
        outlineOffset,
        position,
        whiteSpace,
        wordWrap,
      } = window.getComputedStyle(el);
      return {
        backgroundColor,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        fontSize,
        minHeight,
        outlineWidth,
        outlineStyle,
        outlineColor,
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
        outlineOffset,
        position,
        whiteSpace,
        wordWrap,
      };
    });

    expect(styles.backgroundColor).toBe('rgb(218, 225, 255)');
    expect(styles.paddingTop).toBe('40px');
    expect(styles.paddingRight).toBe('40px');
    expect(styles.paddingBottom).toBe('40px');
    expect(styles.paddingLeft).toBe('40px');
    expect(styles.fontSize).toBe('20px');
    expect(styles.minHeight).toBe('150px');
    expect(styles.borderBottomLeftRadius).toBe('20px');
    expect(styles.borderBottomRightRadius).toBe('20px');
    expect(styles.borderTopLeftRadius).toBe('20px');
    expect(styles.borderTopRightRadius).toBe('20px');
    expect(styles.outlineOffset).toBe('-20px');
    expect(styles.outlineWidth).toBe('3px');
    expect(styles.outlineStyle).toBe('dashed');
    expect(styles.outlineColor).toBe('rgb(0, 94, 128)');
    expect(styles.whiteSpace).toBe('pre-wrap');
  });

  test('mouse drag undo restores typed selected text replacement', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop native drag proof');

    const editor = await openExample(page, 'slate/styling', {
      ready: {
        editor: 'visible',
      },
    });
    const originalText = 'This editor is styled using the style prop.';
    const selectedText = 'using';
    const selectionStart = originalText.indexOf(selectedText);
    const selectionEnd = selectionStart + selectedText.length;

    await editor.selection.dragTextRange({
      endOffset: selectionEnd,
      startOffset: selectionStart,
      text: originalText,
    });

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe(selectedText);

    await page.keyboard.type('changed');
    await editor.assert.text('This editor is styled changed the style prop.');

    await page.keyboard.press(
      await editor.root.evaluate(() =>
        /Mac OS X/.test(navigator.userAgent) ? 'Meta+Z' : 'Control+Z'
      )
    );

    await editor.assert.text(originalText);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: selectionStart },
      focus: { path: [0, 0], offset: selectionEnd },
    });
    await expect.poll(() => editor.get.selectedText()).toBe(selectedText);
  });
});
