import { recordPliteBrowserRuntimeErrors } from '@platejs/browser/playwright';
import { expect, test } from '@playwright/test';

const EDITOR_ROOT = '[data-plite-editor="true"][contenteditable="true"]';

test('comment: first composer stays anchored to the selected text', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });

    const editor = page.locator(EDITOR_ROOT).first();
    const target = editor
      .locator('[data-plite-node="element"]')
      .filter({ hasText: 'Experience a modern rich-text editor' })
      .first();

    await expect(target).toBeVisible();
    await target.scrollIntoViewIfNeeded();

    const targetBox = await target.boundingBox();

    expect(targetBox).not.toBeNull();

    const y = targetBox!.y + 10;

    await page.mouse.move(targetBox!.x + 70, y);
    await page.mouse.down();
    await page.mouse.move(targetBox!.x + 180, y, { steps: 5 });
    await page.mouse.up();

    const selectedText = await page.evaluate(
      () => window.getSelection()?.toString() ?? ''
    );

    expect(selectedText.trim()).not.toBe('');

    const commentButton = page
      .locator(
        'div[role="toolbar"].sticky button:has(svg.lucide-message-square-text)'
      )
      .first();

    await expect(commentButton).toBeVisible();
    await commentButton.click();

    const popover = page.locator('[data-slot="popover-content"]');
    const replyInput = popover.locator(
      '[data-plite-editor="true"][contenteditable="true"]'
    );

    await expect(replyInput).toBeVisible();
    await expect(replyInput).toBeFocused();
    await expect(popover.locator('[data-plite-placeholder="true"]')).toHaveText(
      'Reply...'
    );

    const popoverWrapper = page
      .locator('[data-radix-popper-content-wrapper]')
      .filter({ has: popover });
    const selectedCommentMarks = page
      .locator('.plite-comment')
      .filter({ hasText: selectedText });
    const commentMark = selectedCommentMarks.last();
    const popoverBox = await popoverWrapper.boundingBox();
    const commentBox = await commentMark.boundingBox();

    expect(popoverBox).not.toBeNull();
    expect(commentBox).not.toBeNull();
    expect(popoverBox!.x).toBeGreaterThan(12);
    expect(popoverBox!.y).toBeGreaterThan(12);
    expect(
      Math.abs(
        popoverBox!.x +
          popoverBox!.width / 2 -
          (commentBox!.x + commentBox!.width / 2)
      )
    ).toBeLessThan(220);
    expect(
      Math.min(
        Math.abs(popoverBox!.y + popoverBox!.height - commentBox!.y),
        Math.abs(commentBox!.y + commentBox!.height - popoverBox!.y)
      )
    ).toBeLessThan(20);

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('comment: closing an unsubmitted composer cleans only its draft mark', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });

    const editor = page.locator(EDITOR_ROOT).first();
    const target = editor
      .locator('[data-plite-node="element"]')
      .filter({ hasText: 'Experience a modern rich-text editor' })
      .first();

    await expect(target).toBeVisible();
    await target.scrollIntoViewIfNeeded();

    const modernBox = await target.evaluate((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();

      while (textNode && !textNode.textContent?.includes('modern')) {
        textNode = walker.nextNode();
      }

      if (!textNode?.textContent) return null;

      const start = textNode.textContent.indexOf('modern');
      const range = document.createRange();

      range.setStart(textNode, start);
      range.setEnd(textNode, start + 'modern'.length);

      const rect = range.getBoundingClientRect();

      return {
        height: rect.height,
        width: rect.width,
        x: rect.x,
        y: rect.y,
      };
    });

    expect(modernBox).not.toBeNull();

    await page.mouse.dblclick(
      modernBox!.x + modernBox!.width / 2,
      modernBox!.y + modernBox!.height / 2
    );

    const selectedText = await page.evaluate(
      () => window.getSelection()?.toString() ?? ''
    );

    expect(selectedText).toBe('modern');

    const floatingToolbar = page
      .locator('div[role="toolbar"].absolute.z-50')
      .first();
    const commentButton = floatingToolbar
      .locator('button:has(svg.lucide-message-square-text)')
      .first();

    await expect(floatingToolbar).toBeVisible();
    await commentButton.click();

    const popover = page.locator('[data-slot="popover-content"]');
    const selectedCommentMarks = page
      .locator('.plite-comment')
      .filter({ hasText: selectedText });

    await expect(popover).toBeVisible();
    await expect(selectedCommentMarks).toHaveCount(1);

    const caretPoint = await target.evaluate((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();

      while (textNode && !textNode.textContent?.includes('rich-text')) {
        textNode = walker.nextNode();
      }

      if (!textNode?.textContent) return null;

      const offset =
        textNode.textContent.indexOf('rich-text') + 'rich-t'.length;
      const range = document.createRange();

      range.setStart(textNode, offset - 1);
      range.setEnd(textNode, offset);

      const rect = range.getBoundingClientRect();

      return {
        x: rect.right + 0.5,
        y: rect.y + rect.height / 2,
      };
    });

    expect(caretPoint).not.toBeNull();

    await page.mouse.click(caretPoint!.x, caretPoint!.y);

    await expect(popover).toBeHidden();
    await expect(selectedCommentMarks).toHaveCount(0);
    await expect(editor).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const selection = window.getSelection();

          if (!selection?.isCollapsed || !selection.anchorNode) return null;

          const text = selection.anchorNode.textContent ?? '';

          return {
            after: text.slice(
              selection.anchorOffset,
              selection.anchorOffset + 3
            ),
            before: text.slice(
              Math.max(0, selection.anchorOffset - 'rich-t'.length),
              selection.anchorOffset
            ),
          };
        })
      )
      .toEqual({ after: 'ext', before: 'rich-t' });
    await expect(floatingToolbar).toBeHidden();

    await page.keyboard.type('X');
    await expect(editor).toContainText('rich-tXext');
    await expect(popover).toBeHidden();
    await expect(floatingToolbar).toBeHidden();

    await page.reload({ waitUntil: 'commit' });

    const existingComment = page
      .locator('.plite-comment')
      .filter({ hasText: 'comments' })
      .first();

    await expect(existingComment).toBeVisible();
    await existingComment.scrollIntoViewIfNeeded();

    const existingCommentBox = await existingComment.boundingBox();

    expect(existingCommentBox).not.toBeNull();

    await page.mouse.move(
      existingCommentBox!.x + 2,
      existingCommentBox!.y + 10
    );
    await page.mouse.down();
    await page.mouse.move(
      existingCommentBox!.x + existingCommentBox!.width - 2,
      existingCommentBox!.y + 10,
      { steps: 5 }
    );
    await page.mouse.up();

    const overlappingCommentButton = page
      .locator(
        'div[role="toolbar"].sticky button:has(svg.lucide-message-square-text)'
      )
      .first();

    await overlappingCommentButton.click();

    const overlappingPopover = page.locator('[data-slot="popover-content"]');

    await expect(overlappingPopover).toBeVisible();
    await page.mouse.click(20, 20);
    await expect(overlappingPopover).toBeHidden();
    await expect(
      page.locator('.plite-comment').filter({ hasText: 'comments' })
    ).toHaveCount(1);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('comment: resolving a submitted comment preserves floating toolbar recovery', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });

    const editor = page.locator(EDITOR_ROOT).first();
    const target = editor
      .locator('[data-plite-node="element"]')
      .filter({ hasText: 'Experience a modern rich-text editor' })
      .first();
    const modernBox = await target.evaluate((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();

      while (textNode && !textNode.textContent?.includes('modern')) {
        textNode = walker.nextNode();
      }

      if (!textNode?.textContent) return null;

      const start = textNode.textContent.indexOf('modern');
      const range = document.createRange();

      range.setStart(textNode, start);
      range.setEnd(textNode, start + 'modern'.length);

      const rect = range.getBoundingClientRect();

      return {
        height: rect.height,
        width: rect.width,
        x: rect.x,
        y: rect.y,
      };
    });

    expect(modernBox).not.toBeNull();

    await page.mouse.dblclick(
      modernBox!.x + modernBox!.width / 2,
      modernBox!.y + modernBox!.height / 2
    );

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('modern');

    const floatingToolbar = page
      .locator(
        'div[role="toolbar"].absolute.z-50:has(button:has(svg.lucide-bold))'
      )
      .first();

    await expect(floatingToolbar).toBeVisible();

    const targetText = await target.innerText();
    const commentButton = floatingToolbar
      .locator('button:has(svg.lucide-message-square-text)')
      .first();

    await commentButton.click();

    const popover = page.locator('[data-slot="popover-content"]');
    const replyInput = popover.locator(
      '[data-plite-editor="true"][contenteditable="true"]'
    );

    await expect(popover).toBeVisible();
    await expect(replyInput).toBeFocused();
    await replyInput.fill('Resolve this comment');

    const submitButton = popover.locator('button:has(svg.lucide-arrow-up)');

    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    const submittedComment = page
      .locator('.plite-comment')
      .filter({ hasText: 'modern' });
    const firstComment = popover
      .getByRole('heading', { name: 'Alice' })
      .locator('..')
      .locator('..');

    await expect(submittedComment).toHaveCount(1);
    await submittedComment.click();
    await expect(popover).toBeVisible();
    await expect(firstComment).toBeVisible();
    await firstComment.hover();

    const resolveButton = firstComment.locator('button:has(svg.lucide-check)');

    await expect(resolveButton).toBeVisible();
    await resolveButton.click();

    await expect(popover).toBeHidden();
    await expect(submittedComment).toHaveCount(0);
    await expect(target).toHaveText(targetText);
    await expect
      .poll(() =>
        page.evaluate((editorSelector) => {
          const selection = window.getSelection();
          const editorElement = document.querySelector(editorSelector);

          if (!selection?.anchorNode || !editorElement) return false;

          return (
            selection.anchorNode.isConnected &&
            editorElement.contains(selection.anchorNode)
          );
        }, EDITOR_ROOT)
      )
      .toBe(true);
    await expect(editor).toBeFocused();

    const richTextBox = await target.evaluate((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();

      while (textNode && !textNode.textContent?.includes('rich-text')) {
        textNode = walker.nextNode();
      }

      if (!textNode?.textContent) return null;

      const start = textNode.textContent.indexOf('rich-text');
      const range = document.createRange();

      range.setStart(textNode, start);
      range.setEnd(textNode, start + 'rich-text'.length);

      const rect = range.getBoundingClientRect();

      return {
        height: rect.height,
        width: rect.width,
        x: rect.x,
        y: rect.y,
      };
    });

    expect(richTextBox).not.toBeNull();

    await page.mouse.dblclick(
      richTextBox!.x + richTextBox!.width / 2,
      richTextBox!.y + richTextBox!.height / 2
    );

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('text');

    await expect(floatingToolbar).toBeVisible();

    const toolbarBox = await floatingToolbar.boundingBox();

    expect(toolbarBox).not.toBeNull();
    expect(toolbarBox!.width).toBeGreaterThan(0);
    expect(toolbarBox!.height).toBeGreaterThan(0);

    await floatingToolbar.locator('button:has(svg.lucide-bold)').click();
    await expect(
      target.locator('strong').filter({ hasText: 'text' })
    ).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
