import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Locator, test } from '@playwright/test';

type EditorNode = {
  bold?: boolean;
  children?: EditorNode[];
  italic?: boolean;
  text?: string;
};

const marked = (node: EditorNode): string =>
  node.children
    ? node.children.map(marked).join('')
    : node.bold
      ? `**${node.text}**`
      : (node.text ?? '');

const takesFocusSoon = (editor: Locator) =>
  editor.evaluate(
    (element) =>
      new Promise<boolean>((resolve) => {
        let focused = element.contains(document.activeElement);
        const onFocus = () => {
          focused = true;
        };

        element.addEventListener('focusin', onFocus);
        setTimeout(() => {
          element.removeEventListener('focusin', onFocus);
          resolve(focused);
        }, 500);
      })
  );

test('[plate#5209] More formatting refocuses the editor only for closes it owns', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/cn/docs/block-menu', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const harness = createBrowserEditorHarness(
      page,
      'more-formatting-dismiss',
      editor
    );
    await harness.ready({ editor: 'visible' });
    const word = editor.locator('[data-editor-string]').first();
    const floating = page.locator('[role="toolbar"]').filter({
      has: page.getByRole('button', { name: 'Mark as equation', exact: true }),
    });
    const trigger = floating.getByRole('button', {
      name: 'More formatting',
      exact: true,
    });
    const subscript = page.getByRole('menuitem', {
      name: 'Subscript',
      exact: true,
    });
    const nativeSelection = () =>
      page.evaluate(() => window.getSelection()?.toString());

    await word.dblclick();
    await trigger.click();
    await expect(subscript).toBeVisible();
    await page.getByRole('heading', { level: 1 }).click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    expect(await takesFocusSoon(editor)).toBe(false);
    await expect(floating).toHaveCount(0);

    await word.dblclick();
    const selection = await harness.get.selection();
    if (!selection) {
      throw new Error('Double-clicking the word selected nothing');
    }
    const selectedText = await harness.get.selectedText();
    const selected = await nativeSelection();
    expect(selected?.length).toBeGreaterThan(0);

    await trigger.click();
    await expect(subscript).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(editor).toBeFocused();
    await expect(trigger).toBeVisible();
    expect(await harness.get.selection()).toEqual(selection);

    await trigger.click();
    await expect(subscript).toBeVisible();
    await trigger.click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(editor).toBeFocused();
    await expect(trigger).toBeVisible();
    expect(await harness.get.selection()).toEqual(selection);
    await expect.poll(nativeSelection).toBe(selected);

    const blockIndex = selection.anchor.path[0];
    const [start, end] = [selection.anchor.offset, selection.focus.offset].sort(
      (a, b) => a - b
    );
    const markedBlocks = async () =>
      (
        (await harness.get.modelValue()) as { children: EditorNode[] }
      ).children.map(marked);
    const expected = await markedBlocks();
    const blockText = expected[blockIndex];

    expect(selection.anchor.path).toEqual([blockIndex, 0]);
    expect(selection.focus.path).toEqual([blockIndex, 0]);
    expect(blockText).not.toContain('**');
    expect(blockText.slice(start, end)).toBe(selectedText);
    expected[blockIndex] =
      `${blockText.slice(0, start)}**${selectedText}**${blockText.slice(end)}`;

    await floating.getByRole('button', { name: /^Bold/ }).click();
    await expect.poll(markedBlocks).toEqual(expected);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('[plate#5209] the floating toolbar stays while a press that closes More formatting is held', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/cn/docs/block-menu', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const harness = createBrowserEditorHarness(page, 'held-close', editor);
    await harness.ready({ editor: 'visible' });
    const floating = page.locator('[role="toolbar"]').filter({
      has: page.getByRole('button', { name: 'Mark as equation', exact: true }),
    });
    const trigger = floating.getByRole('button', {
      name: 'More formatting',
      exact: true,
    });

    await editor.locator('[data-editor-string]').first().dblclick();
    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible();
    const box = await trigger.boundingBox();
    if (!box) throw new Error('More formatting has no box');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();

    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(editor).toBeFocused();
    await expect(floating).toBeVisible();
    await page.mouse.up();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

for (const menu of ['Turn into', 'More formatting'] as const) {
  test(`[plate#5209] a Bold press while ${menu} is open bolds the range and keeps the toolbar for the next action`, async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      await page.goto('/cn/docs/block-menu', { waitUntil: 'commit' });
      const editor = page
        .locator('[data-editor="true"][contenteditable="true"]')
        .first();
      const harness = createBrowserEditorHarness(page, 'sibling-press', editor);
      await harness.ready({ editor: 'visible' });
      const floating = page.locator('[role="toolbar"]').filter({
        has: page.getByRole('button', {
          name: 'Mark as equation',
          exact: true,
        }),
      });

      await editor.locator('[data-editor-string]').first().dblclick();
      const selection = await harness.get.selection();
      if (!selection) {
        throw new Error('Double-clicking the word selected nothing');
      }
      const selectedText = await harness.get.selectedText();
      const marks = async () =>
        (
          (await harness.get.modelValue()) as { children: EditorNode[] }
        ).children[selection.anchor.path[0]].children?.find(
          (leaf) => leaf.text === selectedText
        );
      await floating
        .getByRole('button', {
          name: menu === 'Turn into' ? /^Turn into/ : menu,
        })
        .click();
      await expect(page.getByRole('menu')).toBeVisible();
      await floating.getByRole('button', { name: /^Bold/ }).click();

      await expect(page.getByRole('menu')).toHaveCount(0);
      await expect.poll(marks).toMatchObject({ bold: true });
      await expect(editor).toBeFocused();
      await expect(floating).toBeVisible();
      expect(await harness.get.selectedText()).toBe(selectedText);

      await floating.getByRole('button', { name: /^Italic/ }).click();
      await expect.poll(marks).toMatchObject({ bold: true, italic: true });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}

for (const menu of ['More formatting', 'Turn into'] as const) {
  test(`[plate#5209] an outside press closes the fixed toolbar ${menu} without refocusing the editor`, async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      await page.goto('/cn/docs/block-menu', { waitUntil: 'commit' });
      const editor = page
        .locator('[data-editor="true"][contenteditable="true"]')
        .first();
      const harness = createBrowserEditorHarness(page, 'fixed-menu', editor);
      await harness.ready({ editor: 'visible' });
      const fixed = page.locator('[role="toolbar"]').filter({
        has: page.getByRole('button', { name: 'Undo', exact: true }),
      });

      await editor.locator('[data-editor-string]').first().dblclick();
      await fixed
        .getByRole(
          'button',
          menu === 'Turn into'
            ? { name: /^Turn into/ }
            : { name: menu, exact: true }
        )
        .click();
      await expect(page.getByRole('menu')).toBeVisible();
      await page.getByRole('heading', { level: 1 }).click();

      await expect(page.getByRole('menu')).toHaveCount(0);
      expect(await takesFocusSoon(editor)).toBe(false);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}

test('[plate#5209] a script that moves focus out of the floating toolbar More formatting keeps focus where it went', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/cn/docs/block-menu', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const harness = createBrowserEditorHarness(page, 'focus-out', editor);
    await harness.ready({ editor: 'visible' });
    const floating = page.locator('[role="toolbar"]').filter({
      has: page.getByRole('button', { name: 'Mark as equation', exact: true }),
    });

    await editor.locator('[data-editor-string]').first().dblclick();
    await floating
      .getByRole('button', { name: 'More formatting', exact: true })
      .click();
    await expect(
      page.getByRole('menuitem', { name: 'Subscript', exact: true })
    ).toBeVisible();
    await page.evaluate(() => {
      const input = document.createElement('input');

      input.setAttribute('aria-label', 'Outside input');
      input.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647';
      document.body.append(input);
      input.focus();
    });

    await expect(page.getByRole('menu')).toHaveCount(0);
    expect(await takesFocusSoon(editor)).toBe(false);
    await expect(
      page.getByRole('textbox', { name: 'Outside input', exact: true })
    ).toBeFocused();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('[plate#5209] a press on the fixed toolbar font size input while Turn into is open keeps focus in the input', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/cn/docs/block-menu', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const harness = createBrowserEditorHarness(page, 'font-size', editor);
    await harness.ready({ editor: 'visible' });
    const fixed = page.locator('[role="toolbar"]').filter({
      has: page.getByRole('button', { name: 'Undo', exact: true }),
    });
    const fontSize = fixed.getByRole('textbox', {
      name: 'Font size',
      exact: true,
    });

    await editor.locator('[data-editor-string]').first().click();
    await fixed.getByRole('button', { name: /^Turn into/ }).click();
    await expect(
      page.getByRole('menuitemradio', { name: 'Heading 1', exact: true })
    ).toBeVisible();
    await fontSize.click();

    await expect(page.getByRole('menu')).toHaveCount(0);
    expect(await takesFocusSoon(editor)).toBe(false);
    await expect(fontSize).toBeFocused();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

for (const bar of ['floating', 'fixed'] as const) {
  test(`[plate#5209] Turn into pressed while More formatting is open on the ${bar} toolbar keeps its menu and focus`, async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      await page.goto('/cn/docs/block-menu', { waitUntil: 'commit' });
      const editor = page
        .locator('[data-editor="true"][contenteditable="true"]')
        .first();
      const harness = createBrowserEditorHarness(page, 'sibling-menu', editor);
      await harness.ready({ editor: 'visible' });
      const toolbar = page.locator('[role="toolbar"]').filter({
        has: page.getByRole(
          'button',
          bar === 'floating'
            ? { name: 'Mark as equation', exact: true }
            : { name: /^Undo/ }
        ),
      });
      const word = editor.locator('[data-editor-string]').first();
      const turnInto = page.getByRole('menu').filter({
        has: page.getByRole('menuitemradio', {
          name: 'Heading 1',
          exact: true,
        }),
      });

      await (bar === 'floating' ? word.dblclick() : word.click());
      await toolbar
        .getByRole('button', { name: 'More formatting', exact: true })
        .click();
      await expect(
        page.getByRole('menuitem', { name: 'Subscript', exact: true })
      ).toBeVisible();
      await toolbar.getByRole('button', { name: /^Turn into/ }).click();

      await expect(turnInto).toBeVisible();
      expect(await takesFocusSoon(editor)).toBe(false);
      await expect(page.getByRole('menu')).toHaveCount(1);
      await expect(turnInto).toBeVisible();
      expect(
        await turnInto.evaluate((menu) => menu.contains(document.activeElement))
      ).toBe(true);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}
