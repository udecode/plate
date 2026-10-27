import { expect, test } from '@platejs/test/playwright';

test('codeblock:copy-button-covers-no-install-command-text-at-375px', async ({
  page,
}) => {
  await page.setViewportSize({ height: 812, width: 375 });
  await page.goto('/docs/components/autoformat', { waitUntil: 'commit' });

  const manualTab = page.getByRole('tab', { name: 'Manual' });
  // Clicks on the server-rendered tab are lost until React hydrates it.
  await expect(async () => {
    await manualTab.click();
    await expect(manualTab).toHaveAttribute('aria-selected', 'true', {
      timeout: 1000,
    });
  }).toPass();

  const command = page.locator('.codeblock', { hasText: 'npm install' });
  await command.scrollIntoViewIfNeeded();

  const covered = await command.evaluate((element) => {
    const button = element
      .parentElement!.querySelector(':scope > button')!
      .getBoundingClientRect();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let characters = '';

    while (walker.nextNode()) {
      const text = walker.currentNode as Text;

      for (let index = 0; index < text.length; index++) {
        if (!text.data[index].trim()) continue;

        range.setStart(text, index);
        range.setEnd(text, index + 1);
        const box = range.getBoundingClientRect();

        if (
          box.right > button.left &&
          box.left < button.right &&
          box.bottom > button.top &&
          box.top < button.bottom
        ) {
          characters += text.data[index];
        }
      }
    }

    return characters;
  });

  expect(covered).toBe('');
});
