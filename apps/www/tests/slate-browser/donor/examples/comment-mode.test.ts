import { expect, type Page, test } from '@playwright/test';

import { openExample } from '@platejs/browser/playwright';

const selectCommentModeIntro = async (page: Page) => {
  await page.locator('#comment-mode').evaluate((root) => {
    const document = root.ownerDocument;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let textNode: Node | null = null;

    let nextNode = walker.nextNode();

    while (nextNode) {
      if (nextNode.textContent?.startsWith('Comment mode in Slate v2')) {
        textNode = nextNode;
        break;
      }

      nextNode = walker.nextNode();
    }

    if (!textNode?.textContent) {
      throw new Error('Comment mode intro text node was not found');
    }

    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 24);

    const selection = document.defaultView?.getSelection();

    if (!selection) {
      throw new Error('Window selection is unavailable');
    }

    selection.removeAllRanges();
    selection.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
};

const selectCommentModeIntroWithPointer = async (
  page: Page,
  rootSelector = '#comment-mode'
) => {
  const start = await getTextOffsetPoint(page, rootSelector, 0);
  const end = await getTextOffsetPoint(page, rootSelector, 24);

  await page.mouse.move(start.x + 1, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x + 2, end.y, {
    steps: 20,
  });
  await page.mouse.up();
};

const getTextOffsetPoint = async (
  page: Page,
  rootSelector: string,
  offset: number
) =>
  page
    .locator(`${rootSelector} [data-slate-string]`)
    .first()
    .evaluate((element, textOffset) => {
      const textNode = element.firstChild;

      if (!textNode) {
        throw new Error('Slate string text node was not found');
      }

      const range = document.createRange();
      range.setStart(textNode, textOffset);
      range.setEnd(textNode, textOffset);

      const rect = range.getBoundingClientRect();

      return {
        x: rect.left,
        y: rect.top + rect.height / 2,
      };
    }, offset);

const getDOMSelectionOffset = (page: Page) =>
  page.evaluate(() => window.getSelection()?.anchorOffset ?? null);

const writerSelection = (page: Page) =>
  page.locator('.slate-comment-mode-writer-pane .slate-comment-mode-code');

test.describe('comment mode example', () => {
  test('allows real pointer selection to add a comment in the read-only editor', async ({
    page,
  }) => {
    await openExample(page, 'slate/comment-mode', {
      ready: {
        editor: 'visible',
      },
    });

    await selectCommentModeIntroWithPointer(page);

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toContain('Comment mode in Slate v');
    await expect(page.locator('#comment-mode-selection')).toContainText(
      'selection:0.0:0|'
    );
    await expect(page.locator('#comment-mode-selection')).not.toHaveText(
      'selection:0.0:0|0.0:0'
    );
    await expect(
      page.getByRole('button', { name: 'Add comment on selection' })
    ).toBeEnabled();

    await page
      .getByRole('button', { name: 'Add comment on selection' })
      .click();

    await expect(page.locator('#comment-card-comment-1')).toContainText(
      'Comment 1 - open'
    );
    await expect(page.locator('#comment-card-comment-1')).toContainText(
      'Discuss: Comment mode in Slate v'
    );
    await expect(page.locator('#comment-card-comment-1')).toContainText(
      'range:0.0:0|'
    );
    await expect(page.locator('#comment-mode-document-writes')).toHaveText('0');
    await expect(page.locator('#comment-mode-comment-writes')).toHaveText('1');
    await expect(page.locator('#comment-mode-read-only-writes')).toHaveText(
      '0'
    );
  });

  test('blurs the read-only comment editor after clicking outside it', async ({
    page,
  }) => {
    await openExample(page, 'slate/comment-mode', {
      ready: {
        editor: 'visible',
      },
    });

    const commentMode = page.locator('#comment-mode');

    await selectCommentModeIntroWithPointer(page);

    await expect(commentMode).toBeFocused();
    await expect(page.locator('#comment-mode-selection')).not.toHaveText(
      'selection:none'
    );

    await page.getByText('Edit mode owns document writes.').click();

    await expect(commentMode).not.toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.activeElement?.id || document.activeElement?.tagName
        )
      )
      .not.toBe('comment-mode');
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('');
    await expect(page.locator('#comment-mode-selection')).toHaveText(
      'selection:none'
    );
  });

  test('blurs the edit-mode document editor after clicking its header', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'desktop focus blur proof');

    await openExample(page, 'slate/comment-mode', {
      ready: {
        editor: 'visible',
      },
    });

    const documentEditor = page.locator('#comment-mode-document');

    await documentEditor.click();

    await expect(documentEditor).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.activeElement?.id || document.activeElement?.tagName
        )
      )
      .toBe('comment-mode-document');

    await page.getByText('Edit mode', { exact: true }).click();

    await expect(documentEditor).not.toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.activeElement?.id || document.activeElement?.tagName
        )
      )
      .not.toBe('comment-mode-document');

    await page.keyboard.type('x');

    await expect(page.locator('#comment-mode-document-writes')).toHaveText('0');
    await expect(page.locator('#comment-mode-read-only-writes')).toHaveText(
      '0'
    );
  });

  test('allows pointer text selection in the edit-mode editor after outside blur', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'desktop drag selection proof'
    );

    await openExample(page, 'slate/comment-mode', {
      ready: {
        editor: 'visible',
      },
    });

    const documentEditor = page.locator('#comment-mode-document');

    await documentEditor.click();
    await page.getByText('Edit mode', { exact: true }).click();

    await expect(documentEditor).not.toBeFocused();

    await selectCommentModeIntroWithPointer(page, '#comment-mode-document');

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toContain('Comment mode in Slate v');
  });

  test('places the edit-mode caret from event coordinates after a comment-mode selection', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'desktop click-to-caret proof'
    );

    await openExample(page, 'slate/comment-mode', {
      ready: {
        editor: 'visible',
      },
    });

    const documentEditor = page.locator('#comment-mode-document');
    const targetOffset = 32;

    await selectCommentModeIntroWithPointer(page);
    await expect(page.locator('#comment-mode')).toBeFocused();
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toContain('Comment mode in Slate v');

    const point = await getTextOffsetPoint(
      page,
      '#comment-mode-document',
      targetOffset
    );

    await page.mouse.move(point.x, point.y);
    await page.mouse.down();

    await expect(documentEditor).toBeFocused();
    await expect.poll(() => getDOMSelectionOffset(page)).toBe(targetOffset);
    await expect(writerSelection(page)).toHaveText(
      `selection:0.0:${targetOffset}|0.0:${targetOffset}`
    );

    await page.mouse.up();

    await expect.poll(() => getDOMSelectionOffset(page)).toBe(targetOffset);
    await expect(writerSelection(page)).toHaveText(
      `selection:0.0:${targetOffset}|0.0:${targetOffset}`
    );
    await expect(page.locator('#comment-mode-selection')).toHaveText(
      'selection:none'
    );
  });

  test('keeps comment sidebar, inline review slices, and widget panel in sync', async ({
    page,
  }) => {
    await openExample(page, 'slate/comment-mode', {
      ready: {
        editor: 'visible',
      },
    });

    await expect(page.locator('#comment-mode')).toHaveCSS('z-index', '0');
    await expect(page.locator('#comment-mode-document')).toHaveCSS(
      'z-index',
      '0'
    );
    await expect(page.locator('#comment-mode')).toContainText(
      'Comment mode in Slate v2'
    );
    await expect(page.locator('#comment-mode-document')).toContainText(
      'Comment mode in Slate v2'
    );

    await selectCommentModeIntro(page);
    await expect(
      page.getByRole('button', { name: 'Add comment on selection' })
    ).toBeEnabled();
    await expect(page.locator('#comment-mode-selection')).toContainText(
      '0.0:0|0.0:24'
    );

    await page
      .getByRole('button', { name: 'Add comment on selection' })
      .click();

    await expect(page.locator('#comment-card-comment-1')).toContainText(
      'range:0.0:0|0.0:24'
    );
    await expect(page.locator('#comment-mode-document-writes')).toHaveText('0');
    await expect(page.locator('#comment-mode-comment-writes')).toHaveText('1');
    await expect(page.locator('#comment-mode-read-only-writes')).toHaveText(
      '0'
    );
    await expect(page.locator('[data-comment-tone]')).toHaveCount(2);
    await expect(page.locator('[data-comment-tone="review"]')).toHaveCount(2);
    await expect(page.locator('#comment-card-comment-1')).toHaveCount(1);
    await expect(page.locator('text=comment-1-widget:Comment 1')).toHaveCount(
      1
    );

    await page
      .getByRole('button', { name: 'Insert paragraph before first comment' })
      .click();

    await expect(page.locator('#comment-mode-document-writes')).toHaveText('1');
    await expect(page.locator('#comment-mode-comment-writes')).toHaveText('1');
    await expect(page.locator('[data-comment-tone="review"]')).toHaveCount(2);
    await expect(
      page.locator('text=Inserted review context before the first comment.')
    ).toHaveCount(2);
    await expect(page.locator('#comment-card-comment-1')).toHaveCount(1);
    await expect(page.locator('text=comment-1-widget:Comment 1')).toHaveCount(
      1
    );

    await page
      .getByRole('button', { name: 'Insert prefix before first comment' })
      .click();

    await expect(page.locator('#comment-mode-document-writes')).toHaveText('2');
    await expect(page.locator('#comment-mode-comment-writes')).toHaveText('1');
    await expect(page.locator('[data-comment-tone="review"]')).toHaveCount(2);
    await expect(page.locator('text=comment-1-widget:Comment 1')).toHaveCount(
      1
    );

    await page.getByRole('button', { name: 'Update first comment' }).click();

    await expect(page.locator('#comment-mode-document-writes')).toHaveText('2');
    await expect(page.locator('#comment-mode-comment-writes')).toHaveText('2');
    await expect(page.locator('#comment-mode-read-only-writes')).toHaveText(
      '0'
    );
    await expect(
      page.locator('text=Updated from the comment channel.')
    ).toHaveCount(1);

    await page.getByRole('button', { name: 'Toggle resolved' }).click();

    await expect(page.locator('#comment-mode-document-writes')).toHaveText('2');
    await expect(page.locator('#comment-mode-comment-writes')).toHaveText('3');
    await expect(page.locator('#comment-mode-read-only-writes')).toHaveText(
      '0'
    );
    await expect(page.locator('[data-comment-status="resolved"]')).toHaveCount(
      2
    );

    await page.getByRole('button', { name: 'Clear comments' }).click();

    await expect(page.locator('#comment-mode-comment-writes')).toHaveText('4');
    await expect(page.locator('#comment-card-comment-1')).toHaveCount(0);
    await expect(page.locator('text=comment-1-widget:Comment 1')).toHaveCount(
      0
    );
    await expect(page.locator('[data-comment-tone]')).toHaveCount(0);
  });
});
