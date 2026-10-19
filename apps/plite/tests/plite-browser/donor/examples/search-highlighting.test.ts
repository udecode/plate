import { expect, test } from '@playwright/test';
import {
  installReactRenderProfiler,
  openExample,
  resetReactRenderProfiler,
  takeBrowserRenderStateSnapshot,
} from '@platejs/test/playwright';

test.describe('search highlighting', () => {
  const openSearchHighlighting = async (
    page: Parameters<typeof openExample>[0]
  ) => {
    await installReactRenderProfiler(page);

    const editor = await openExample(page, 'plite/search-highlighting', {
      ready: {
        editor: 'visible',
        selector: 'input[type="search"]',
      },
    });

    await expect(page.getByRole('textbox')).toHaveCount(1);

    return editor;
  };

  test('highlights the searched text', async ({ page }) => {
    const searchField = 'input[type="search"]';
    const highlightedText = 'search-highlighted';

    await openSearchHighlighting(page);
    await page.locator(searchField).fill('text');
    await expect(page.locator(`[data-cy="${highlightedText}"]`)).toHaveCount(2);
  });

  test('keeps focus in search input after the editor was focused', async ({
    page,
  }) => {
    const editor = await openSearchHighlighting(page);
    const searchField = page.locator('input[type="search"]');
    const highlightedText = 'search-highlighted';

    await resetReactRenderProfiler(page);
    await page.locator('[data-editor="true"]').click();
    await searchField.click();
    await expect(searchField).toBeFocused();
    await resetReactRenderProfiler(page);
    await page.keyboard.type('t');

    await expect(searchField).toBeFocused();
    await expect(searchField).toHaveValue('t');
    await expect(
      page.locator(`[data-cy="${highlightedText}"]`)
    ).not.toHaveCount(0);

    const proof = await takeBrowserRenderStateSnapshot(editor);

    expect(proof.focusOwner.kind).toBe('outside');
    expect(proof.focusOwner.tagName).toBe('input');
    expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(2);
    expect(proof.renderCounts.byKind.element ?? 0).toBe(0);
    expect(proof.renderCounts.byKind.void ?? 0).toBe(0);
    expect(proof.renderCounts.total).toBeGreaterThan(0);
  });
});
