import {
  type BrowserEditorHarness,
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

const EDITOR_ROOT = '[data-editor="true"][contenteditable="true"]';

const openField = async (page: Page, url: string, name: string) => {
  await page.goto(url, { waitUntil: 'commit' });

  const root = page.locator(EDITOR_ROOT).first();
  const editor = createBrowserEditorHarness(page, name, root);

  await editor.ready({ editor: 'visible' });

  return { editor, root };
};

const paragraph = async (editor: BrowserEditorHarness) => {
  const value = (await editor.get.modelValue()) as {
    children: Array<{ children: Array<{ text?: string; value?: string }> }>;
  };

  return value.children[0].children;
};

const chips = async (editor: BrowserEditorHarness) => {
  const nodes = await paragraph(editor);

  return nodes.flatMap((node) =>
    node.value === undefined ? [] : [node.value]
  );
};

const AFTER_FIRST_CHIP = { offset: 0, path: [0, 2] };

test('select-editor: ArrowDown moves the active option while the caret sits after the search', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const { editor, root } = await openField(
      page,
      '/blocks/select-editor-demo',
      'select-editor:arrow-down'
    );

    await editor.selection.collapse(AFTER_FIRST_CHIP);
    await editor.focus();
    await editor.type('o');

    const second = page.getByRole('option').nth(1);
    const label = await second.textContent();

    await editor.press('ArrowDown');
    await expect(second).toHaveAttribute('aria-selected', 'true');
    await expect(root).toHaveAttribute(
      'aria-activedescendant',
      (await second.getAttribute('id')) ?? ''
    );
    await editor.press('Enter');
    await expect.poll(() => chips(editor)).toEqual(['Editor', label]);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

for (const close of ['Escape', 'ControlOrMeta+Enter', 'outside click']) {
  test(`select-editor: ${close} closes the menu and clears the search`, async ({
    page,
  }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

    try {
      const { editor } = await openField(
        page,
        '/blocks/select-editor-demo',
        `select-editor:close-${close}`
      );

      await editor.selection.collapse(AFTER_FIRST_CHIP);
      await editor.focus();
      await editor.type('bu');
      await expect(page.getByRole('listbox')).toBeVisible();

      if (close === 'outside click') {
        await page.mouse.click(5, 5);
      } else {
        await page.keyboard.press(close);
      }

      await expect(page.getByRole('listbox')).toHaveCount(0);
      await expect.poll(() => editor.get.modelText()).toBe('');
      expect(await chips(editor)).toEqual(['Editor']);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}

test('select-editor: read-only chips link to their url, from the starting value and from a pick', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const { editor } = await openField(
      page,
      '/blocks/select-editor-demo',
      'select-editor:read-only-links'
    );
    const toggle = page.locator('[data-invalid] button').first();

    await editor.selection.collapse(AFTER_FIRST_CHIP);
    await editor.focus();
    await editor.type('butt');
    await editor.press('Enter');
    await expect.poll(() => chips(editor)).toEqual(['Editor', 'Button']);

    await toggle.click();
    await expect(page.locator('a[href="/docs/components/editor"]')).toHaveCount(
      1
    );
    await expect(page.locator('a[href="/docs/components/button"]')).toHaveCount(
      1
    );

    await toggle.click();
    await expect(page.locator(EDITOR_ROOT)).toBeVisible();
    await expect(page.locator('a[href^="/docs/components/"]')).toHaveCount(0);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: moving the caret away clears the search it leaves behind', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const { editor } = await openField(
      page,
      '/blocks/select-editor-demo',
      'select-editor:caret-move-cleanup'
    );

    await editor.selection.collapse(AFTER_FIRST_CHIP);
    await editor.focus();
    await editor.type('bu');
    await editor.press('Home');

    await expect.poll(() => editor.get.modelText()).toBe('');
    expect(await chips(editor)).toEqual(['Editor']);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: a form that refuses a pick gets its value back', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const { editor } = await openField(
      page,
      '/dev/select-editor-scale?items=20&chips=1&refuse=1',
      'select-editor:refused-pick'
    );

    await editor.selection.collapse(AFTER_FIRST_CHIP);
    await editor.focus();
    await editor.type('Zeta 0001');
    await expect(page.getByRole('option').first()).toHaveText('Zeta 00010');
    await editor.press('Enter');

    await expect.poll(() => chips(editor)).toEqual(['Item 00001']);
    await expect(page.locator('main')).toHaveAttribute('data-scale-chips', '1');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: a search that keeps a long list shows its active option', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  const listbox = page.getByRole('listbox');

  try {
    const { editor } = await openField(
      page,
      '/dev/select-editor-scale?items=400&chips=1',
      'select-editor:long-search'
    );

    await editor.selection.collapse(AFTER_FIRST_CHIP);
    await editor.focus();
    await expect(page.getByRole('option')).toHaveCount(400);
    for (let step = 0; step < 40; step++) await editor.press('ArrowDown');
    await expect
      .poll(() => listbox.evaluate((list) => list.scrollTop))
      .toBeGreaterThan(300);

    await editor.type('i');
    await expect(page.getByRole('option')).toHaveCount(359);
    await expect
      .poll(() =>
        listbox.evaluate((list) => {
          const option = list
            .querySelector('[aria-selected="true"]')!
            .getBoundingClientRect();
          const view = list.getBoundingClientRect();

          return option.top >= view.top && option.bottom <= view.bottom;
        })
      )
      .toBe(true);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: hovering an option at the edge of the list does not scroll it', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  const listbox = page.getByRole('listbox');

  try {
    const { editor } = await openField(
      page,
      '/dev/select-editor-scale?items=200&chips=1',
      'select-editor:edge-hover'
    );

    await editor.selection.collapse(AFTER_FIRST_CHIP);
    await editor.focus();
    await expect(page.getByRole('option')).toHaveCount(200);

    const box = (await listbox.boundingBox())!;
    const edge = box.y + box.height - 3;

    await page.mouse.move(box.x + 20, edge - 2);
    await page.mouse.move(box.x + 20, edge);
    await expect(
      page.locator('[role="option"][aria-selected="true"]')
    ).not.toHaveText('Item 00002');
    await page.waitForTimeout(300);
    expect(await listbox.evaluate((list) => list.scrollTop)).toBe(0);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: Backspace removes the chip before the caret and the next letter lands in its place', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const { editor } = await openField(
      page,
      '/dev/select-editor-scale?items=20&chips=3',
      'select-editor:backspace-between-chips'
    );

    await editor.selection.collapse({ offset: 0, path: [0, 4] });
    await editor.focus();
    await editor.press('Backspace');
    await expect
      .poll(() => chips(editor))
      .toEqual(['Item 00001', 'Item 00003']);
    await expect(page.locator('main')).toHaveAttribute('data-scale-chips', '2');

    await editor.type('z');

    const nodes = await paragraph(editor);

    expect(nodes.map((node) => node.value ?? node.text)).toEqual([
      '',
      'Item 00001',
      'z',
      'Item 00003',
      '',
    ]);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: the editable is a combobox that names its active option and takes the form props', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const { editor, root } = await openField(
      page,
      '/blocks/select-editor-demo',
      'select-editor:aria'
    );

    await expect(root).toHaveAttribute('role', 'combobox');
    await expect(root).toHaveAttribute('aria-autocomplete', 'list');
    await expect(root).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(root).toHaveAttribute('aria-label', 'Labels');
    await expect(root).toHaveAttribute('aria-invalid', 'false');
    await expect(root).toHaveAttribute('aria-expanded', 'false');
    expect(
      await root.evaluate((node) => node.hasAttribute('aria-multiline'))
    ).toBe(false);

    await editor.selection.collapse(AFTER_FIRST_CHIP);
    await editor.focus();
    await expect(root).toHaveAttribute('aria-expanded', 'true');
    await expect(root).toHaveAttribute(
      'aria-controls',
      (await page.getByRole('listbox').getAttribute('id')) ?? ''
    );
    await expect(root).toHaveAttribute(
      'aria-activedescendant',
      (await page.getByRole('option').first().getAttribute('id')) ?? ''
    );
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: pasted text becomes the search', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const { editor } = await openField(
      page,
      '/blocks/select-editor-demo',
      'select-editor:paste'
    );

    await editor.selection.collapse(AFTER_FIRST_CHIP);
    await editor.focus();
    await editor.clipboard.pasteText('Button');
    await expect(page.getByRole('option')).toHaveText(['Button']);
    await editor.press('Enter');

    await expect.poll(() => chips(editor)).toEqual(['Editor', 'Button']);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: dragging the last chip before the first reorders the value', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const { editor } = await openField(
      page,
      '/dev/select-editor-scale?items=20&chips=3',
      'select-editor:drag'
    );
    const chipsDOM = page.locator('[data-editor-void]');

    const first = chipsDOM.nth(0);
    const box = await first.boundingBox();

    await chipsDOM.nth(2).dragTo(first, {
      targetPosition: { x: 1, y: (box?.height ?? 2) / 2 },
    });

    await expect
      .poll(() => chips(editor))
      .toEqual(['Item 00003', 'Item 00001', 'Item 00002']);
    await expect(page.locator('main')).toHaveAttribute(
      'data-scale-last',
      'Item 00002'
    );
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('select-editor: composed text becomes the search', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const { editor } = await openField(
      page,
      '/blocks/select-editor-demo',
      'select-editor:composition'
    );

    await editor.selection.collapse(AFTER_FIRST_CHIP);
    await editor.focus();
    await editor.ime.compose({ text: 'Butt' });
    await expect(page.getByRole('option').first()).toHaveText('Button');
    await editor.press('Enter');

    await expect.poll(() => chips(editor)).toEqual(['Editor', 'Button']);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
