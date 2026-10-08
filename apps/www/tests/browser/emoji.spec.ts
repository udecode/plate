import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

import { routeEmojibase } from './emojibase-route';

const EDITOR_ROOT = '[data-editor="true"][contenteditable="true"]';

const openPicker = async (page: Page) => {
  await page.goto('/blocks/emoji-demo', { waitUntil: 'commit' });
  const root = page.locator(EDITOR_ROOT).first();
  const editor = createBrowserEditorHarness(page, 'emoji-picker', root);

  await editor.ready({ editor: 'visible', text: 'Emoji' });
  await editor.selection.collapse({ offset: 'Emoji'.length, path: [0, 0] });
  await editor.focus();

  const button = page.getByRole('button', { exact: true, name: 'Emoji' });
  const search = page.getByRole('combobox', { name: 'Search emoji' });

  await button.click();
  await expect(search).toBeFocused();

  return { button, editor, search };
};

const fireResult = (page: Page) =>
  page.getByRole('option', { exact: true, name: 'Fire' });

test('emoji:toolbar picks the top result at the caret and returns focus', async ({
  page,
}) => {
  await routeEmojibase(page);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { button, editor, search } = await openPicker(page);

    await search.pressSequentially('fire');
    await expect(fireResult(page)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(search).toHaveCount(0);
    await editor.assert.modelBlockText(0, 'Emoji🔥');
    await editor.assert.focusOwner('editor');
    await page.keyboard.type('x');
    await editor.assert.modelBlockText(0, 'Emoji🔥x');

    await button.click();
    await expect(search).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(search).toHaveCount(0);
    await expect(button).toBeFocused();
    await editor.assert.modelBlockText(0, 'Emoji🔥x');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

for (const shape of ['composing', 'webkit'] as const) {
  test(`emoji:picker ignores the Enter that confirms an IME composition (${shape})`, async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== 'chromium',
      'Chromium composition protocol'
    );
    await routeEmojibase(page);
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { editor, search } = await openPicker(page);
      const client = await page.context().newCDPSession(page);
      const enter = (keyCode: number) =>
        client.send('Input.dispatchKeyEvent', {
          code: 'Enter',
          key: 'Enter',
          type: 'rawKeyDown',
          windowsVirtualKeyCode: keyCode,
        });

      await client.send('Input.imeSetComposition', {
        selectionEnd: 4,
        selectionStart: 4,
        text: 'fire',
      });
      await expect(fireResult(page)).toHaveAttribute('aria-selected', 'true');

      if (shape === 'composing') {
        await enter(13);
        await client.send('Input.insertText', { text: 'fire' });
      } else {
        await client.send('Input.insertText', { text: 'fire' });
        await enter(229);
      }

      await expect(search).toBeFocused();
      await expect(search).toHaveValue('fire');
      await editor.assert.modelBlockText(0, 'Emoji');

      await page.keyboard.press('Enter');
      await expect(search).toHaveCount(0);
      await editor.assert.modelBlockText(0, 'Emoji🔥');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}

test('emoji:picker stays open on the Escape that cancels an IME composition', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Chromium composition protocol');
  await routeEmojibase(page);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { button, search } = await openPicker(page);
    const client = await page.context().newCDPSession(page);

    await client.send('Input.imeSetComposition', {
      selectionEnd: 4,
      selectionStart: 4,
      text: 'fire',
    });
    await client.send('Input.dispatchKeyEvent', {
      code: 'Escape',
      key: 'Escape',
      type: 'rawKeyDown',
      windowsVirtualKeyCode: 27,
    });

    await expect(search).toBeFocused();

    await client.send('Input.insertText', { text: 'fire' });
    await page.keyboard.press('Escape');
    await expect(search).toHaveCount(0);
    await expect(button).toBeFocused();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('emoji:callout sets its icon from the picker without inserting text', async ({
  page,
}) => {
  await routeEmojibase(page);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/callout-demo', { waitUntil: 'commit' });
    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(page, 'callout-icon', root);

    await editor.ready({ editor: 'visible', text: 'Callouts' });
    const icon = root.getByRole('button', { exact: true, name: '💡' });
    const search = page.getByRole('combobox', { name: 'Search emoji' });
    const before = await editor.get.modelText();

    await icon.click();
    await expect(search).toBeFocused();
    await search.pressSequentially('rocket');
    await expect(search).toHaveValue('rocket');
    await expect(
      page.getByRole('option', { exact: true, name: 'Rocket' })
    ).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');

    await expect(search).toHaveCount(0);
    await expect(
      root.getByRole('button', { exact: true, name: '🚀' })
    ).toBeVisible();
    expect(await editor.get.modelText()).toBe(before);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('emoji:picker search waits for the list instead of reporting no match', async ({
  page,
}) => {
  const emojibase = await routeEmojibase(page);
  const release = emojibase.hold();
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { search } = await openPicker(page);

    await search.pressSequentially('fire');
    await expect(
      page.getByRole('dialog').getByRole('status', { name: 'Loading emoji' })
    ).toBeVisible();

    release();
    await expect(fireResult(page)).toHaveAttribute('aria-selected', 'true');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('emoji:toolbar pick undoes on its own', async ({ page }) => {
  await routeEmojibase(page);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/emoji-demo', { waitUntil: 'commit' });
    const root = page.locator(EDITOR_ROOT).first();
    const editor = createBrowserEditorHarness(page, 'emoji-undo', root);

    await editor.ready({ editor: 'visible', text: 'Emoji' });
    await editor.selection.collapse({ offset: 'Emoji'.length, path: [0, 0] });
    await editor.focus();
    await page.keyboard.type('ab');
    await editor.assert.modelBlockText(0, 'Emojiab');

    await page.getByRole('button', { exact: true, name: 'Emoji' }).click();
    const search = page.getByRole('combobox', { name: 'Search emoji' });

    await search.pressSequentially('fire');
    await expect(fireResult(page)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await editor.assert.modelBlockText(0, 'Emojiab🔥');

    await page.keyboard.press('ControlOrMeta+z');
    await editor.assert.modelBlockText(0, 'Emojiab');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('emoji:picker shows a pick under Frequently used on reopen', async ({
  page,
}) => {
  await routeEmojibase(page);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { button, search } = await openPicker(page);

    await search.pressSequentially('fire');
    await expect(fireResult(page)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(search).toHaveCount(0);

    await button.click();
    await expect(
      page
        .getByRole('group', { name: 'Frequently used' })
        .getByRole('button', { exact: true, name: 'Fire' })
    ).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('emoji:picker says the list is unavailable when it cannot load', async ({
  page,
}) => {
  const emojibase = await routeEmojibase(page);

  emojibase.setOffline(true);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { search } = await openPicker(page);

    await expect(
      page.getByRole('dialog').getByText('Emoji unavailable')
    ).toBeVisible();
    await search.pressSequentially('fi');
    await expect(
      page.getByRole('dialog').getByText('Emoji unavailable')
    ).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
