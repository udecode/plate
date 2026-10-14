import { expect, test } from '@playwright/test';

for (const { file, slug, title } of [
  {
    file: 'autoformat.tsx',
    slug: 'autoformat',
    title: 'block-viewer-code:file-header-buttons-stay-reachable-at-375px',
  },
  {
    file: 'toolbar.tsx',
    slug: 'toolbar',
    title:
      'block-viewer-code:file-tree-leaves-header-buttons-reachable-at-375px',
  },
]) {
  test(title, async ({ page }) => {
    await page.setViewportSize({ height: 812, width: 375 });
    await page.goto(`/docs/components/${slug}`, { waitUntil: 'commit' });

    const manualTab = page.getByRole('tab', { name: 'Manual' });
    // Clicks on the server-rendered tab are lost until React hydrates it.
    await expect(async () => {
      await manualTab.click();
      await expect(manualTab).toHaveAttribute('aria-selected', 'true', {
        timeout: 1000,
      });
    }).toPass();

    const header = page.locator('figcaption', { hasText: file });
    const buttons = header.locator('button');
    await expect(buttons).toHaveCount(2);
    await header.evaluate((element) =>
      element.scrollIntoView({ block: 'center' })
    );

    const reachable = await buttons.evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();

        return element.contains(
          document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height / 2
          )
        );
      })
    );

    expect(reachable).toEqual([true, true]);
  });
}
