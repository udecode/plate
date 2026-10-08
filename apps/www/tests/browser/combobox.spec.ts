import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

import { routeEmojibase } from './emojibase-route';

const EDITOR_ROOT = '[data-editor="true"][contenteditable="true"]';

const openDemo = async (page: Page, route: string, text: string) => {
  await page.goto(route, { waitUntil: 'commit' });
  const root = page.locator(EDITOR_ROOT).first();
  const editor = createBrowserEditorHarness(page, route, root);

  await editor.ready({ editor: 'visible', text });
  await editor.selection.collapse({ offset: 0, path: [0, 0] });
  await editor.focus();

  return { editor, root };
};

for (const activation of ['Enter', 'click'] as const) {
  test(`combobox:slash AI in a suggested paragraph with ${activation}`, async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

    try {
      await page.goto('/', { waitUntil: 'commit' });
      const root = page.locator(EDITOR_ROOT).first();
      const editor = createBrowserEditorHarness(page, 'slash:suggesting', root);
      await editor.ready({ editor: 'visible', text: 'Collaborative Editing' });
      await page.getByRole('button', { name: 'Editing', exact: true }).click();
      await page
        .getByRole('menuitemradio', { name: 'Suggestion', exact: true })
        .click();
      await expect(
        page.getByRole('button', { name: 'Suggestion', exact: true })
      ).toBeVisible();
      await editor.selection.collapse({
        path: [1, 4],
        offset: ' to discover more.'.length,
      });
      await editor.focus();
      await page.keyboard.press('Enter');
      await editor.assert.modelBlockText(2, '');
      await page.keyboard.type('/AI');
      await expect(
        page.getByRole('option', { name: 'AI', exact: true })
      ).toBeVisible();
      await editor.assert.focusOwner('editor');
      await editor.assert.modelBlockText(2, '/AI');

      if (activation === 'Enter') await page.keyboard.press('Enter');
      else await page.getByRole('option', { name: 'AI', exact: true }).click();

      const prompt = page.getByPlaceholder('Ask AI anything...');
      await expect(prompt).toBeFocused();
      await expect(root).not.toHaveAttribute('aria-controls');
      await editor.assert.modelBlockText(2, '');
      await editor.assert.selection({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      });
      await prompt.press('Escape');
      await expect(prompt).toHaveCount(0);
      await expect(root).toBeFocused();
      await page.keyboard.type('Still here');
      await editor.assert.modelBlockText(2, 'Still here');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}

test('combobox:mention completes typed text and undo restores it', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/mention-demo',
      'Mention'
    );

    await page.keyboard.type('@biggs');
    await expect(
      page.getByRole('option', { exact: true, name: 'Biggs Darklighter' })
    ).toBeVisible();
    await expect(
      page.getByRole('option', { exact: true, name: 'Aayla Secura' })
    ).toHaveCount(0);
    await editor.assert.focusOwner('editor');
    await expect(root).toHaveAttribute('aria-controls');
    await expect(page.getByRole('combobox', { expanded: true })).toHaveCount(1);
    await editor.assert.modelBlockText(0, '@biggsMention');

    await page.keyboard.press('Enter');
    await expect(root).not.toHaveAttribute('aria-controls');
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await expect(
      root.locator('[data-editor-value="Biggs Darklighter"]')
    ).toHaveCount(1);
    await editor.assert.modelBlockText(0, 'Mention');

    await page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+z' : 'Control+z'
    );
    await editor.assert.modelBlockText(0, '@biggsMention');
    await expect(
      root.locator('[data-editor-value="Biggs Darklighter"]')
    ).toHaveCount(0);
    await expect(root).not.toHaveAttribute('aria-controls');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:a mention completed at a block end keeps typing after it', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/mention-demo',
      'Mention'
    );
    const firstBlock = await editor.get.modelBlockText(0);
    const end = firstBlock?.length ?? 0;

    await editor.selection.collapse({ offset: end, path: [0, 0] });
    await page.keyboard.type(' @biggs');
    await expect(
      page.getByRole('option', { exact: true, name: 'Biggs Darklighter' })
    ).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(
      root.locator('[data-editor-value="Biggs Darklighter"]')
    ).toHaveCount(1);
    await page.keyboard.type('!');

    const block = (await editor.get.modelValue()) as {
      children: Array<{ children: Array<{ text?: string; type?: string }> }>;
    };
    const children = block.children[0]?.children ?? [];

    expect(children.at(-2)?.type).toBe('mention');
    expect(children.at(-1)?.text).toBe('!');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

const readActiveOption = (page: Page) =>
  page.evaluate(() => {
    const active = document.querySelector('[role="option"][data-active-item]');
    const list = active?.closest('[role="listbox"]');

    if (!active || !list) return null;

    const options = [...list.querySelectorAll('[role="option"]')];

    const listRect = list.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    return {
      index: options.indexOf(active),
      inView:
        activeRect.top >= listRect.top - 1 &&
        activeRect.bottom <= listRect.bottom + 1,
      last: options.length - 1,
      scrollable: list.scrollHeight > list.clientHeight,
    };
  });

test('combobox:arrow keys scroll the active option into view', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await openDemo(page, '/blocks/slash-command-demo', 'Slash Command');

    await page.keyboard.type('/');
    await expect(page.getByRole('option').first()).toBeVisible();
    await expect
      .poll(() => readActiveOption(page))
      .toMatchObject({ index: 0, scrollable: true });

    await page.keyboard.press('ArrowUp');
    await expect
      .poll(() => readActiveOption(page))
      .toMatchObject({ inView: true });
    const wrapped = await readActiveOption(page);
    expect(wrapped?.index).toBe(wrapped?.last);

    await page.keyboard.press('ArrowDown');
    await expect
      .poll(() => readActiveOption(page))
      .toMatchObject({ index: 0, inView: true });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:filtering out the active option scrolls the first into view', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await openDemo(page, '/blocks/slash-command-demo', 'Slash Command');

    await page.keyboard.type('/');
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.keyboard.press('ArrowUp');
    await expect
      .poll(async () => {
        const active = await readActiveOption(page);

        return active !== null && active.index === active.last;
      })
      .toBe(true);

    await page.keyboard.type('c');
    await expect
      .poll(() => readActiveOption(page))
      .toMatchObject({ index: 0, inView: true, scrollable: true });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:Escape keeps the query as text without reopening', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/slash-command-demo',
      'Slash Command'
    );

    await page.keyboard.type('/h');
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(root).not.toHaveAttribute('aria-controls');
    await page.keyboard.type('1');
    await expect(root).not.toHaveAttribute('aria-controls');
    await editor.assert.modelBlockText(0, '/h1Slash Command');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:an outside click closes the popup and keeps the query', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/mention-demo',
      'Mention'
    );

    await page.keyboard.type('@biggs');
    await expect(
      page.getByRole('option', { exact: true, name: 'Biggs Darklighter' })
    ).toBeVisible();

    await page.mouse.click(2, 2);
    await expect(page.getByRole('option')).toHaveCount(0);
    await expect(root).not.toHaveAttribute('aria-controls');
    const focusOwner = await editor.get.focusOwner();

    expect(focusOwner.kind).not.toBe('editor');
    await editor.assert.modelBlockText(0, '@biggsMention');

    await editor.dom.clickTextOffset({ offset: 6, path: [0, 0] });
    await page.keyboard.type('x');
    await editor.assert.modelBlockText(0, '@biggsxMention');
    await expect(page.getByRole('option')).toHaveCount(0);
    await expect(root).not.toHaveAttribute('aria-controls');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:a click past the query closes the popup at the clicked caret', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/mention-demo',
      'Mention'
    );

    await page.keyboard.type('@biggs');
    await expect(
      page.getByRole('option', { exact: true, name: 'Biggs Darklighter' })
    ).toBeVisible();

    await editor.dom.clickTextOffset({ offset: 10, path: [0, 0] });
    await expect(page.getByRole('option')).toHaveCount(0);
    await expect(root).not.toHaveAttribute('aria-controls');
    await editor.assert.selection({
      anchor: { offset: 10, path: [0, 0] },
      focus: { offset: 10, path: [0, 0] },
    });
    await editor.assert.modelBlockText(0, '@biggsMention');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:a slash inside prose leaves Enter as a line break', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/slash-command-demo',
      'Slash Command'
    );

    await page.keyboard.type('Page 1 / 2');
    await expect(root).not.toHaveAttribute('aria-controls');
    await page.keyboard.press('Enter');
    await editor.assert.modelBlockText(0, 'Page 1 / 2');
    await editor.assert.modelBlockText(1, 'Slash Command');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:moving past the typed query closes the popup', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/slash-command-demo',
      'Slash Command'
    );

    await page.keyboard.type('/');
    await expect(root).toHaveAttribute('aria-controls');
    await page.keyboard.press('End');
    await expect(root).not.toHaveAttribute('aria-controls');
    await page.keyboard.press('Enter');
    await editor.assert.modelBlockText(0, '/Slash Command');
    await editor.assert.modelBlockText(1, '');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:emoji completes a closed shortcode', async ({ page }) => {
  await routeEmojibase(page);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/emoji-demo',
      'Emoji'
    );

    await page.keyboard.type(':smile:');
    await editor.assert.modelBlockText(0, ':smile:Emoji');
    await expect(page.getByRole('option').first()).toHaveText(/^😄/);
    await page.keyboard.press('Enter');
    await expect(root).not.toHaveAttribute('aria-controls');
    await editor.assert.modelBlockText(0, '😄Emoji');
    await editor.assert.focusOwner('editor');

    await page.keyboard.press('ControlOrMeta+z');
    await editor.assert.modelBlockText(0, ':smile:Emoji');
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await editor.assert.modelBlockText(0, '😄Emoji');
    await page.keyboard.type('x');
    await editor.assert.modelBlockText(0, '😄xEmoji');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:emoji stays closed inside a code block', async ({ page }) => {
  await routeEmojibase(page);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/emoji-demo',
      'Emoji'
    );

    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('```');
    await expect(root.locator('pre').first()).toBeVisible();
    await page.keyboard.type('a :smile');
    await editor.assert.modelBlockText(1, 'a :smile');
    await expect(root).not.toHaveAttribute('aria-controls');
    await expect(page.getByRole('option')).toHaveCount(0);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:emoji Enter while the list loads keeps the query', async ({
  page,
}) => {
  const release = (await routeEmojibase(page)).hold();
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/emoji-demo',
      'Emoji'
    );
    const blocks = await editor.get.modelBlockTexts();

    await page.keyboard.type(':smile');
    await expect(page.getByText('Loading emoji…')).toBeVisible();
    await page.keyboard.press('Enter');
    await editor.assert.modelBlockText(0, ':smileEmoji');
    expect(await editor.get.modelBlockTexts()).toHaveLength(blocks.length);
    await expect(root).toHaveAttribute('aria-controls');

    release();
    await expect(page.getByRole('option').first()).toHaveText(/^😄/);
    await page.keyboard.press('Enter');
    await editor.assert.modelBlockText(0, '😄Emoji');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:emoji works offline after one load and recovers without a reload', async ({
  page,
}) => {
  const emojibase = await routeEmojibase(page);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    let { editor } = await openDemo(page, '/blocks/emoji-demo', 'Emoji');

    await page.keyboard.type(':smile:');
    await expect(page.getByRole('option').first()).toHaveText(/^😄/);

    emojibase.setOffline(true);
    ({ editor } = await openDemo(page, '/blocks/emoji-demo', 'Emoji'));
    await page.keyboard.type(':smile:');
    await expect(page.getByRole('option').first()).toHaveText(/^😄/);
    await page.keyboard.press('Enter');
    await editor.assert.modelBlockText(0, '😄Emoji');

    await page.evaluate(() => localStorage.clear());
    ({ editor } = await openDemo(page, '/blocks/emoji-demo', 'Emoji'));
    await page.keyboard.type(':smil');
    await expect(page.getByText('Emoji unavailable')).toBeVisible();

    emojibase.setOffline(false);
    await page.keyboard.type('e');
    await expect(page.getByRole('option').first()).toHaveText(/^😄/);
    await page.keyboard.press('Enter');
    await editor.assert.modelBlockText(0, '😄Emoji');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:footnote replaces [^ with a new reference', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/footnote-demo',
      'Footnotes'
    );

    await page.keyboard.type('[^');
    await expect(
      page.getByRole('option', { name: /New footnote/ })
    ).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(root).not.toHaveAttribute('aria-controls');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{
            children?: Array<{ text?: string; type?: string }>;
          }>;
        };
        const block = value.children[0]?.children ?? [];

        return {
          literal: block.some((node) => node.text?.includes('[^')),
          reference: block.some((node) => node.type === 'footnoteReference'),
        };
      })
      .toEqual({ literal: false, reference: true });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:IME preedit filters without publishing text', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Chromium composition protocol');
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor } = await openDemo(page, '/blocks/mention-demo', 'Mention');
    const client = await page.context().newCDPSession(page);

    await editor.ime.enableKeyEvents();
    await page.keyboard.type('@');
    await expect(page.getByRole('option').first()).toBeVisible();
    await client.send('Input.imeSetComposition', {
      selectionEnd: 5,
      selectionStart: 5,
      text: 'biggs',
    });
    await expect(
      page.getByRole('option', { exact: true, name: 'Biggs Darklighter' })
    ).toBeVisible();
    await expect(
      page.getByRole('option', { exact: true, name: 'Aayla Secura' })
    ).toHaveCount(0);
    await editor.assert.modelBlockText(0, '@Mention');

    await client.send('Input.insertText', { text: 'biggs' });
    await editor.assert.modelBlockText(0, '@biggsMention');
    await expect(
      page.getByRole('option', { exact: true, name: 'Biggs Darklighter' })
    ).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:an IME-committed trigger opens the popup', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Chromium composition protocol');
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor } = await openDemo(page, '/blocks/mention-demo', 'Mention');
    const client = await page.context().newCDPSession(page);

    await editor.ime.enableKeyEvents();
    await client.send('Input.imeSetComposition', {
      selectionEnd: 1,
      selectionStart: 1,
      text: '@',
    });
    await client.send('Input.insertText', { text: '@' });
    await editor.assert.modelBlockText(0, '@Mention');
    await expect(page.getByRole('option').first()).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('combobox:clicking an option during IME composition completes it', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Chromium composition protocol');
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await openDemo(
      page,
      '/blocks/mention-demo',
      'Mention'
    );
    const client = await page.context().newCDPSession(page);

    await editor.ime.enableKeyEvents();
    await page.keyboard.type('@');
    await client.send('Input.imeSetComposition', {
      selectionEnd: 5,
      selectionStart: 5,
      text: 'biggs',
    });
    const option = page.getByRole('option', {
      exact: true,
      name: 'Biggs Darklighter',
    });

    await expect(option).toBeVisible();
    await option.click();

    await expect(
      root.locator('[data-editor-value="Biggs Darklighter"]')
    ).toHaveCount(1);
    await editor.assert.modelBlockText(0, 'Mention');
    await editor.assert.selection({
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
    await expect(root).not.toHaveAttribute('aria-controls');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
