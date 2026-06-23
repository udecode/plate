import { expect, test } from '@playwright/test';

import { openExample } from '@platejs/browser/playwright';

test.describe('markdown preview', () => {
  test('checks for markdown', async ({ page }) => {
    const insertedHeading = '## Added markdown heading';

    const editor = await openExample(page, 'plite/markdown-preview', {
      ready: {
        editor: 'visible',
        text: /Try it out for yourself!/,
      },
    });

    const boldSegments = editor.root.locator(
      '.plite-markdown-preview-segment.is-bold'
    );
    const italicSegments = editor.root.locator(
      '.plite-markdown-preview-segment.is-italic'
    );
    const titleSegments = editor.root.locator(
      '.plite-markdown-preview-segment.is-title'
    );

    await expect(
      boldSegments.filter({ hasText: '**decorations**' })
    ).toBeVisible();
    await expect(
      boldSegments.filter({ hasText: '**Markdown**' })
    ).toBeVisible();
    await expect(italicSegments.filter({ hasText: '_dead_' })).toBeVisible();
    await expect(titleSegments).toHaveCount(1);
    await expect(
      titleSegments.filter({ hasText: '## Try it out!' })
    ).toBeVisible();

    await editor.selection.collapse({ path: [2, 0], offset: 24 });
    await editor.insertBreak();
    await editor.insertText(insertedHeading);
    await editor.insertBreak();

    await expect(editor.root).toContainText(insertedHeading);
    await expect(titleSegments).toHaveCount(2);
    await expect(
      titleSegments.filter({ hasText: insertedHeading })
    ).toHaveCount(1);
  });
});
