import { recordPliteBrowserRuntimeErrors } from '@platejs/browser/playwright';
import { type ConsoleMessage, expect, test } from '@playwright/test';

test('docs-sidebar:collapsed-sections-use-compact-row-spacing', async ({
  page,
}) => {
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
  const consoleErrors: string[] = [];
  const onConsole = (message: ConsoleMessage) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  };
  page.on('console', onConsole);

  try {
    await page.goto('/docs/basic-blocks', { waitUntil: 'commit' });

    const navigation = page.getByLabel('Docs navigation');
    const labels = ['Overview', 'Plite', 'Guides'];
    const boxes = await Promise.all(
      labels.map((label) =>
        navigation
          .getByRole('button', { name: new RegExp(`${label}$`) })
          .boundingBox()
      )
    );

    expect(boxes.every(Boolean)).toBe(true);
    expect(boxes[1]!.y - boxes[0]!.y).toBe(32);
    expect(boxes[2]!.y - boxes[1]!.y).toBe(32);
    expect(consoleErrors).toEqual([]);
    runtimeErrors.assertNone();
  } finally {
    page.off('console', onConsole);
    runtimeErrors.stop();
  }
});
