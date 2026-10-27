import {
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';
import type { Page } from '@playwright/test';

type Block = {
  children?: Array<{ text?: string }>;
  indent?: number;
};

const openDemo = async (page: Page) => {
  await page.goto('/blocks/tabbable-demo', { waitUntil: 'commit' });

  const root = page
    .locator('[data-editor="true"][contenteditable="true"]')
    .first();
  const editor = createBrowserEditorHarness(page, 'tabbable:list-tab', root);

  await editor.ready({ editor: 'visible' });

  return { editor, root };
};

test('tabbable kit: Tab nests a list item and Shift+Tab un-nests it, keeping the caret', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(page);
    const item = async () => {
      const value = (await editor.get.modelValue()) as { children: Block[] };

      return value.children[7];
    };

    await root.getByText('List item 2', { exact: true }).click();

    const clicked = await editor.get.selection();
    const offset = clicked?.anchor.offset ?? -1;
    const keepsCaret = async () => {
      await expect(root).toBeFocused();
      await expect.poll(() => editor.get.selection()).toEqual(clicked);
      await expect
        .poll(() => editor.get.domSelection())
        .toMatchObject({ anchorNodeText: 'List item 2', anchorOffset: offset });
    };

    expect(clicked?.anchor.path).toEqual([7, 0]);

    await page.keyboard.press('Tab');
    await expect.poll(item).toMatchObject({ indent: 2 });
    await keepsCaret();

    await page.keyboard.press('Shift+Tab');
    await expect.poll(item).toMatchObject({ indent: 1 });
    await keepsCaret();

    await page.keyboard.type('x');
    await expect.poll(item).toMatchObject({
      children: [
        {
          text: `${'List item 2'.slice(0, offset)}x${'List item 2'.slice(offset)}`,
        },
      ],
    });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('tabbable kit: Tab from a void button moves past the void even when the caret sits in a list', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(page);

    await root.getByText('List item 2', { exact: true }).click();
    await root.getByRole('button', { name: 'Button 2' }).nth(1).click();
    await expect
      .poll(() => editor.get.selection())
      .toMatchObject({ anchor: { path: [7, 0] } });
    await page.keyboard.press('Tab');

    await expect(root).toBeFocused();
    await expect
      .poll(() => editor.get.selection())
      .toEqual({
        anchor: { offset: 0, path: [5, 0] },
        focus: { offset: 0, path: [5, 0] },
      });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
