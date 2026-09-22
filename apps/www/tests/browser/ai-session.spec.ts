import { writeFile } from 'node:fs/promises';

import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('Copilot accepts formatted text before list indentation and supports dismissal', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.route('**/api/ai/copilot', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ text: ' **completion**' }),
      })
    );
    await page.goto('/blocks/copilot-demo', { waitUntil: 'commit' });
    const root = page.locator('.editor-editor[contenteditable="true"]').first();
    const editor = createBrowserEditorHarness(page, 'copilot:session', root);
    await editor.ready({
      editor: 'visible',
      text: 'Choose from the suggested completions:',
    });
    const before = (await editor.get.modelValue()) as { children: unknown[] };
    await page.getByText('Copilot will', { exact: false }).click();
    await root.press('End');
    await expect
      .poll(() => editor.get.selection())
      .toMatchObject({
        focus: {
          path: [3, 2],
          offset: ' suggest completions as you type.'.length,
        },
      });
    const request = page.waitForRequest('**/api/ai/copilot', { timeout: 8000 });
    await root.press('Control+Space');
    await request;
    await expect(root.getByText('completion', { exact: true })).toBeVisible();
    expect(await editor.get.modelValue()).toEqual(before);
    await root.press('Tab');
    errors.assertNone();
    await expect(
      root.locator('strong').filter({ hasText: 'completion' })
    ).toBeVisible();
    await root.press('ControlOrMeta+z');
    await expect
      .poll(
        async () => ((await editor.get.modelValue()) as typeof before).children
      )
      .toEqual(before.children);
    await root.press('Control+Space');
    await expect(root.getByText('completion', { exact: true })).toBeVisible();
    await root.press('Escape');
    await expect(root.getByText('completion', { exact: true })).toHaveCount(0);
    await root.press('!');
    await expect(root).toContainText('type.!');
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('line-forward deletion resets an emptied heading to text', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/ai-demo', { waitUntil: 'commit' });
    const root = page.locator('.editor-editor[contenteditable="true"]').first();
    const editor = createBrowserEditorHarness(page, 'ai:line-delete', root);

    await editor.ready({ editor: 'visible', text: 'AI Menu' });
    await editor.dom.clickTextOffset({
      path: [0, 0],
      offset: 0,
      // Keep the reporter's raw first click; the assertions below prove sync.
      waitForSelectionSync: false,
    });
    await expect
      .poll(() => editor.get.selection())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    await expect
      .poll(() => editor.get.domSelection())
      .toMatchObject({
        anchorNodeText: 'AI Menu',
        anchorOffset: 0,
        focusNodeText: 'AI Menu',
        focusOffset: 0,
      });

    await page.keyboard.press('Meta+Delete');

    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: Array<{ text: string }>; type: string }>;
        };

        return value.children[0];
      })
      .toMatchObject({ children: [{ text: '' }], type: 'paragraph' });
    await expect(root.getByRole('heading', { name: 'AI Menu' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Text' })).toBeVisible();
    const firstBlock = root.locator('[data-editor-path="0"]').first();
    await expect(firstBlock).toHaveClass(/editor-paragraph/);
    const firstBlockBounds = await firstBlock.boundingBox();

    expect(firstBlockBounds?.height ?? 0).toBeGreaterThan(0);
    await page.keyboard.press('Meta+z');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: Array<{ text: string }>; type: string }>;
        };

        return value.children[0];
      })
      .toMatchObject({ children: [{ text: 'AI Menu' }], type: 'heading' });
    await page.keyboard.press('Meta+Shift+z');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: Array<{ text: string }>; type: string }>;
        };

        return value.children[0];
      })
      .toMatchObject({ children: [{ text: '' }], type: 'paragraph' });
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => editor.get.selection())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.insertText('Restored');
    await expect(firstBlock).toHaveText('Restored');
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('undo survives resetting a heading before deleting its words', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/docs/ai', { waitUntil: 'commit' });
    const root = page.locator('.editor-editor[contenteditable="true"]').first();
    const editor = createBrowserEditorHarness(
      page,
      'ai:reset-delete-undo',
      root
    );

    await editor.ready({ editor: 'visible', text: 'AI Menu' });
    await editor.dom.clickTextOffset({
      path: [0, 0],
      offset: 0,
      waitForSelectionSync: false,
    });
    await expect
      .poll(() => editor.get.selection())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

    await page.keyboard.press('Backspace');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: Array<{ text: string }>; type: string }>;
        };

        return value.children[0];
      })
      .toMatchObject({ children: [{ text: 'AI Menu' }], type: 'paragraph' });

    await page.keyboard.press('Meta+ArrowRight');
    await page.keyboard.press('Alt+Backspace');
    await page.keyboard.press('Alt+Backspace');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: Array<{ text: string }>; type: string }>;
        };

        return value.children[0];
      })
      .toMatchObject({ children: [{ text: '' }], type: 'paragraph' });

    await page.keyboard.press('Meta+z');
    errors.assertNone();
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: Array<{ text: string }>; type: string }>;
        };

        return value.children[0];
      })
      .toMatchObject({ children: [{ text: 'AI ' }], type: 'paragraph' });
    await page.keyboard.press('Meta+z');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: Array<{ text: string }>; type: string }>;
        };

        return value.children[0];
      })
      .toMatchObject({ children: [{ text: 'AI Menu' }], type: 'paragraph' });
    await page.keyboard.press('Meta+z');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{
            children: Array<{ text: string }>;
            level?: number;
            type: string;
          }>;
        };

        return value.children[0];
      })
      .toMatchObject({
        children: [{ text: 'AI Menu' }],
        level: 2,
        type: 'heading',
      });
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

for (const toolName of ['generate', 'edit'] as const) {
  test(`AI ${toolName} review renders text, accepts it, and preserves undo on a narrow view`, async ({
    page,
  }, info) => {
    const errors = recordBrowserRuntimeErrors(page);
    const response = `${[
      { type: 'start', messageId: 'preview' },
      { type: 'data-toolName', data: toolName },
      { type: 'text-start', id: 't' },
      { type: 'text-delta', id: 't', delta: 'Generated ' },
      { type: 'text-end', id: 't' },
      { type: 'text-start', id: 'second' },
      { type: 'text-delta', id: 'second', delta: 'preview text.' },
      { type: 'text-end', id: 'second' },
      { type: 'finish' },
    ]
      .map((part) => `data: ${JSON.stringify(part)}\n\n`)
      .join('')}data: [DONE]\n\n`;
    try {
      await page.route('**/api/ai/command', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          headers: { 'x-vercel-ai-ui-message-stream': 'v1' },
          body: response,
        })
      );
      await page.goto('/blocks/ai-demo', { waitUntil: 'commit' });
      const root = page
        .locator('.editor-editor[contenteditable="true"]')
        .first();
      const editor = createBrowserEditorHarness(page, 'ai:session', root);
      await editor.ready({
        editor: 'visible',
        text: 'Generate and refine content with AI.',
      });
      const before = await editor.get.modelValue();
      const beforeChildren = (before as { children: unknown }).children;
      await editor.selection.select({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 36 },
      });
      await root.press('ControlOrMeta+j');
      const prompt = page.getByRole('dialog').getByRole('combobox');
      await prompt.fill('Write a summary');
      await prompt.press('Enter');
      const preview = page.getByRole('dialog').locator('.editor-editor');
      if (toolName === 'edit') {
        await expect(preview).toHaveCount(0);
        await expect(root).toContainText('d preview text.');
        await expect(
          root.locator('[data-editor-authored-change]')
        ).not.toHaveCount(0);
        await root
          .locator('[data-editor-authored-change]')
          .first()
          .scrollIntoViewIfNeeded();
        await info.attach('ai-edit-inline-suggestion', {
          body: await page.screenshot(),
          contentType: 'image/png',
        });
      } else {
        await expect(preview).toContainText('Generated preview text.');
      }
      if (toolName === 'edit') {
        expect(
          ((await editor.get.modelValue()) as { children: unknown }).children
        ).toEqual(beforeChildren);
      } else {
        expect(await editor.get.modelValue()).toEqual(before);
      }
      await expect(
        page.getByRole('button', { name: 'Editing', exact: true })
      ).toBeVisible();
      if (toolName === 'generate') {
        await expect(root.locator('[data-editor-authored-change]')).toHaveCount(
          0
        );
      }
      await page.setViewportSize({ width: 390, height: 844 });
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect
        .poll(() =>
          dialog.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            return bounds.left >= 0 && bounds.right <= window.innerWidth;
          })
        )
        .toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true);
      await info.attach('ai-preview-mobile', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
      await page.getByRole('option', { name: 'Accept', exact: true }).click();
      await expect(root).toContainText('Generated preview text.');
      await expect(root.locator('[data-editor-authored-change]')).toHaveCount(
        0
      );
      await expect(root).toBeFocused();
      await page.keyboard.press('ControlOrMeta+z');
      await expect
        .poll(async () => {
          const value = (await editor.get.modelValue()) as {
            children: unknown;
          };

          return value.children;
        })
        .toEqual(beforeChildren);
      await page.keyboard.insertText('!');
      await expect(root).toContainText('!');
      await page.keyboard.press('ControlOrMeta+z');
      await expect
        .poll(async () => {
          const value = (await editor.get.modelValue()) as {
            children: unknown;
          };

          return value.children;
        })
        .toEqual(beforeChildren);
      await expect(root).toBeFocused();
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}

test('AI edit renders beside the homepage seeded suggestions', async ({
  page,
}, info) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const response = `${[
    { type: 'start', messageId: 'homepage-edit' },
    { type: 'data-toolName', data: 'edit' },
    { type: 'text-start', id: 'text' },
    { type: 'text-delta', id: 'text', delta: 'Improved heading' },
    { type: 'text-end', id: 'text' },
    { type: 'finish' },
  ]
    .map((part) => `data: ${JSON.stringify(part)}\n\n`)
    .join('')}data: [DONE]\n\n`;

  try {
    await page.route('**/api/ai/command', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: { 'x-vercel-ai-ui-message-stream': 'v1' },
        body: response,
      })
    );
    await page.goto('/', { waitUntil: 'commit' });
    const root = page.locator('.editor-editor[contenteditable="true"]').first();
    const editor = createBrowserEditorHarness(page, 'ai:homepage-edit', root);
    const heading = 'Welcome to the Plate Playground!';
    await editor.ready({ editor: 'visible', text: heading });
    await editor.selection.select({
      anchor: { path: [3, 3, 0], offset: 0 },
      focus: { path: [3, 4], offset: 23 },
    });
    await root.press('ControlOrMeta+j');
    await page
      .getByRole('option', { name: 'Improve writing', exact: true })
      .click();

    await expect(root).toContainText('Improved heading');
    const improved = root.locator('[data-editor-authored-change]').filter({
      hasText: 'Improved heading',
    });
    await expect(improved).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Editing', exact: true })
    ).toBeVisible();
    await improved.scrollIntoViewIfNeeded();
    await info.attach('ai-homepage-existing-suggestions', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('AI edit preserves unchanged blocks and suggests only added emoji', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const response = `${[
    { type: 'start', messageId: 'cross-block-edit' },
    { type: 'data-toolName', data: 'edit' },
    { type: 'text-start', id: 'text' },
    ...[
      '## AI-Powered',
      ' Editing 🤖✍️\n\n',
      'Boost your productivity with integrated [AI SDK](/docs/ai). Press ',
      '<kbd>⌘+J</kbd> or <kbd>Space</kbd> in an empty line to:\n\n',
      '* Generate content (continue writing, summarize, explain)\n',
      '* Edit existing text (improve, fix grammar, change tone)',
    ].map((delta) => ({ type: 'text-delta', id: 'text', delta })),
    { type: 'text-end', id: 'text' },
    { type: 'finish' },
  ]
    .map((part) => `data: ${JSON.stringify(part)}\n\n`)
    .join('')}data: [DONE]\n\n`;

  try {
    await page.setViewportSize({ width: 2010, height: 842 });
    await page.route('**/api/ai/command', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: { 'x-vercel-ai-ui-message-stream': 'v1' },
        body: response,
      })
    );
    await page.goto('/', { waitUntil: 'commit' });
    const root = page.locator('.editor-editor[contenteditable="true"]').first();
    const editor = createBrowserEditorHarness(
      page,
      'ai:cross-block-stream',
      root
    );
    await editor.ready({ editor: 'visible', text: 'AI-Powered Editing' });
    const before = (await editor.get.modelValue()) as {
      children: Array<{ children: unknown[]; [key: string]: unknown }>;
    };
    const textContent = (node: unknown): string =>
      typeof node === 'object' && node !== null
        ? 'text' in node && typeof node.text === 'string'
          ? node.text
          : 'children' in node && Array.isArray(node.children)
            ? node.children.map(textContent).join('')
            : ''
        : '';
    await editor.selection.select({
      anchor: { path: [4, 0], offset: 0 },
      focus: {
        path: [7, 0],
        offset: 'Edit existing text (improve, fix grammar, change tone)'.length,
      },
    });
    await root.press('ControlOrMeta+j');
    await page
      .getByRole('option', { name: 'Improve writing', exact: true })
      .click();

    await expect(root).toContainText(
      'Edit existing text (improve, fix grammar, change tone)'
    );
    const emoji = root
      .locator('[data-editor-authored-kind="insert"]')
      .filter({ hasText: '🤖✍️' })
      .first();
    await expect(emoji).toBeVisible();
    const changeId = await emoji.getAttribute('data-editor-authored-change');
    expect(changeId).toBeTruthy();
    expect(
      await root
        .locator(`[data-editor-authored-change="${changeId}"]`)
        .allTextContents()
    ).toEqual([' 🤖✍️']);
    await expect(
      root.locator(
        `[data-editor-authored-change="${changeId}"][data-editor-retained="delete"]`
      )
    ).toHaveCount(0);
    expect(((await editor.get.modelValue()) as typeof before).children).toEqual(
      before.children
    );

    await page.getByRole('option', { name: 'Accept', exact: true }).click();
    await expect
      .poll(async () => {
        const after = (await editor.get.modelValue()) as typeof before;
        return after.children.map(textContent);
      })
      .toEqual(
        before.children.map((node, index) =>
          index === 4 ? 'AI-Powered Editing 🤖✍️' : textContent(node)
        )
      );
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('the AI demo publishes generated comments without changing text', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.route('**/api/ai/command', (route) => {
      const { ctx } = route.request().postDataJSON();
      const blockRef = ctx.refs.blocks.find(
        (block: { path: number[] }) =>
          block.path.length === 1 && block.path[0] === 1
      )?.ref;
      expect(blockRef).toBeTruthy();
      const parts = [
        { type: 'start', messageId: 'comment-review' },
        { type: 'data-toolName', transient: true, data: 'comment' },
        {
          type: 'data-comment',
          transient: true,
          data: {
            status: 'streaming',
            comment: {
              blockRef,
              comment: 'Explain the intended audience.',
              content: 'Generate and refine content with AI.',
            },
          },
        },
        {
          type: 'data-comment',
          transient: true,
          data: { status: 'finished', comment: null },
        },
        { type: 'finish' },
      ];
      return route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: { 'x-vercel-ai-ui-message-stream': 'v1' },
        body: [
          ...parts.map((part) => `data: ${JSON.stringify(part)}\n\n`),
          'data: [DONE]\n\n',
        ].join(''),
      });
    });
    await page.goto('/blocks/ai-demo', { waitUntil: 'commit' });
    const root = page.locator('.editor-editor[contenteditable="true"]').first();
    const editor = createBrowserEditorHarness(page, 'ai:comments', root);
    await editor.ready({ editor: 'visible', text: 'AI Menu' });
    const before = await editor.get.modelValue();
    await editor.selection.select({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 36 },
    });
    await root.press('ControlOrMeta+j');
    await page.getByRole('option', { name: 'Comment', exact: true }).click();
    await expect(
      page.locator('[data-comment-thread][data-status="published"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-comment-thread][data-status="draft"]')
    ).toHaveCount(0);
    expect(await editor.get.modelValue()).toEqual(before);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

for (const scenario of [
  {
    name: 'selected heading',
    route: '/blocks/playground-demo',
    path: [0, 0],
    text: 'Welcome to the Plate Playground!',
  },
  {
    name: 'quoted paragraph',
    route: '/blocks/ai-demo',
    path: [3, 0],
    text: 'Press "⌘ + J".',
  },
  {
    name: 'a partial selection',
    route: '/blocks/ai-demo',
    path: [3, 0],
    text: 'Press "⌘ + J".',
    offset: 12,
    selectCharacters: 5,
  },
] as const) {
  test(`the real Comment response publishes a normal thread from ${scenario.name}`, async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page);
    try {
      await page.goto(scenario.route, { waitUntil: 'commit' });
      const root = page
        .locator('.editor-editor[contenteditable="true"]')
        .first();
      const editor = createBrowserEditorHarness(page, 'ai:real-comment', root);
      await editor.ready({ editor: 'visible', text: scenario.text });
      await editor.dom.clickTextOffset({
        path: [...scenario.path],
        offset: scenario.offset ?? scenario.text.length,
      });
      if (scenario.selectCharacters !== undefined) {
        for (let index = 0; index < scenario.selectCharacters; index++) {
          await page.keyboard.press('Shift+ArrowLeft');
        }
      } else {
        await page.keyboard.press('Shift+Home');
      }
      const before = await editor.get.modelValue();
      await page.keyboard.press('ControlOrMeta+j');
      const responsePromise = page.waitForResponse('**/api/ai/command');
      await page.getByRole('option', { name: 'Comment', exact: true }).click();
      const response = await responsePromise;
      expect(response.ok()).toBe(true);
      await expect(
        page.locator('[data-comment-thread][data-status="published"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-comment-thread][data-status="draft"]')
      ).toHaveCount(0);
      expect(await editor.get.modelValue()).toEqual(before);
      expect(await editor.get.modelValue()).toEqual(before);
      if (scenario.selectCharacters !== undefined) {
        const commentIds = () =>
          root
            .locator('[data-comment-id]')
            .evaluateAll((elements) => [
              ...new Set(
                elements.flatMap((element) =>
                  element.getAttribute('data-comment-id')
                    ? [element.getAttribute('data-comment-id')!]
                    : []
                )
              ),
            ]);
        const completedBeforeStop = await commentIds();
        await editor.dom.clickTextOffset({ path: [0, 0], offset: 7 });
        await page.keyboard.press('Enter');
        const beforeNextRequest = await editor.get.modelValue();
        await page.keyboard.press('ControlOrMeta+j');
        const nextRequest = page.waitForRequest('**/api/ai/command');
        await page
          .getByRole('option', { name: 'Comment', exact: true })
          .click();
        await nextRequest;
        await expect
          .poll(async () => {
            const ids = await commentIds();

            return ids.length;
          })
          .toBeGreaterThan(completedBeforeStop.length);
        const completedAtStop = await commentIds();
        await page.getByRole('button', { name: /Stop/ }).click();
        await expect(
          page.locator('[data-comment-thread][data-status="draft"]')
        ).toHaveCount(0);
        await expect
          .poll(commentIds)
          .toEqual(expect.arrayContaining(completedAtStop));
        expect(await editor.get.modelValue()).toEqual(beforeNextRequest);
      }
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}

test('Explain preserves its generate intent for a document with comments and tables', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/playground-demo', { waitUntil: 'commit' });
    const root = page.locator('.editor-editor[contenteditable="true"]').first();
    const editor = createBrowserEditorHarness(page, 'ai:explain', root);
    const heading = 'Welcome to the Plate Playground!';
    await editor.ready({ editor: 'visible', text: heading });
    await page.getByRole('button', { name: 'Suggestion', exact: true }).click();
    await page
      .getByRole('menuitemradio', { name: 'Editing', exact: true })
      .click();
    await editor.dom.clickTextOffset({ path: [0, 0], offset: heading.length });
    const before = await editor.get.modelBlockTexts();

    await page.keyboard.press('ControlOrMeta+j');
    const responsePromise = page.waitForResponse('**/api/ai/command');
    await page.getByRole('option', { name: 'Explain', exact: true }).click();
    const response = await responsePromise;
    const body = response.request().postDataJSON();
    expect(body.ctx.toolName).toBe('generate');
    expect(body.messages.at(-1).parts[0].text).toContain('comments');
    const stream = await response.text();
    expect(stream).toContain('"type":"data-toolName","data":"generate"');
    expect(stream).not.toContain('"type":"data-comment"');
    expect(stream).not.toContain('"type":"data-table"');
    await expect(
      page.getByRole('option', { name: 'Accept', exact: true })
    ).toBeVisible();
    await expect(root.locator('[data-editor-ai-preview]')).not.toHaveText('');
    await expect.poll(() => editor.get.modelBlockTexts()).toEqual(before);
    await page.getByRole('option', { name: 'Discard', exact: true }).click();
    await expect(root.locator('[data-editor-ai-preview]')).toHaveCount(0);
    await expect.poll(() => editor.get.modelBlockTexts()).toEqual(before);
    await expect(root).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(root.locator('[data-editor-path="1"]')).toHaveText('');
    await page.keyboard.press('Space');
    await page.getByRole('option', { name: 'Explain', exact: true }).click();
    await expect(
      page.getByRole('option', { name: 'Accept', exact: true })
    ).toBeVisible();
    const draft = await root.locator('[data-editor-ai-preview]').innerText();
    expect(draft.trim().length).toBeGreaterThan(0);
    await page.getByRole('option', { name: 'Accept', exact: true }).click();
    await expect(root.locator('[data-editor-ai-preview]')).toHaveCount(0);
    const accepted = await editor.get.modelBlockTexts();
    expect(accepted).toEqual([
      before[0],
      ...draft.trim().split('\n').filter(Boolean),
      ...before.slice(1),
    ]);
    await expect(
      page.getByRole('button', { name: 'Editing', exact: true })
    ).toBeVisible();
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

for (const start of ['heading', 'empty paragraph'] as const) {
  test(`Continue writing streams one complete block from ${start}`, async ({
    page,
  }, testInfo) => {
    const errors = recordBrowserRuntimeErrors(page);
    const response = `${[
      { type: 'start', messageId: 'continue-writing' },
      { type: 'data-toolName', data: 'generate' },
      { type: 'text-start', id: 'text' },
      {
        type: 'text-delta',
        id: 'text',
        delta:
          'AI can help turn an initial idea into a clear and useful first draft.',
      },
      { type: 'text-end', id: 'text' },
      { type: 'finish' },
    ]
      .map((part) => `data: ${JSON.stringify(part)}\n\n`)
      .join('')}data: [DONE]\n\n`;

    try {
      await page.route('**/api/ai/command', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          headers: { 'x-vercel-ai-ui-message-stream': 'v1' },
          body: response,
        })
      );
      await page.goto('/docs/components/ai-menu', { waitUntil: 'commit' });
      const root = page
        .locator('.editor-editor[contenteditable="true"]')
        .first();
      const editor = createBrowserEditorHarness(
        page,
        'ai:continue-writing',
        root
      );
      await editor.ready({ editor: 'visible', text: 'AI Menu' });
      await editor.dom.clickTextOffset({ path: [0, 0], offset: 7 });
      if (start === 'empty paragraph') {
        await page.keyboard.press('Enter');
        await expect(root.locator('[data-editor-path="1"]')).toHaveText('');
      }
      const before = await editor.get.modelBlockTexts();
      await page.keyboard.press(
        start === 'empty paragraph' ? 'Space' : 'ControlOrMeta+j'
      );
      const requestPromise = page.waitForRequest('**/api/ai/command');
      await page
        .getByRole('option', { name: 'Continue writing', exact: true })
        .click();
      const request = await requestPromise;
      const body = request.postDataJSON() as {
        messages: Array<{ parts: Array<{ text?: string; type: string }> }>;
      };
      const instruction = body.messages
        .at(-1)
        ?.parts.find((part) => part.type === 'text')?.text;

      expect(instruction).toMatch(
        start === 'heading'
          ? /<Block>\n## AI Menu\s*\n<\/Block>/
          : /<Document>\n## AI Menu/
      );
      expect(instruction).not.toContain('{block}');

      await expect(page.getByRole('option', { name: 'Accept' })).toBeVisible();
      await expect(root.locator('[data-editor-ai-preview]')).toHaveText(
        'AI can help turn an initial idea into a clear and useful first draft.'
      );
      await expect(root.locator('[data-editor-retained]')).toHaveCount(0);
      await expect.poll(() => editor.get.modelBlockTexts()).toEqual(before);
      await expect(
        page.getByRole('button', { name: 'Editing', exact: true })
      ).toBeVisible();
      await expect(root.locator('[data-editor-authored-change]')).toHaveCount(
        0
      );

      const retryRequest = page.waitForRequest('**/api/ai/command');
      await page
        .getByRole('option', { name: 'Try again', exact: true })
        .click();
      await retryRequest;
      await expect(page.getByRole('option', { name: 'Accept' })).toBeVisible();
      await expect(root.locator('[data-editor-ai-preview]')).toHaveText(
        'AI can help turn an initial idea into a clear and useful first draft.'
      );
      await expect(root.locator('[data-editor-retained]')).toHaveCount(0);
      await page.getByRole('option', { name: 'Discard', exact: true }).click();
      await expect.poll(() => editor.get.modelBlockTexts()).toEqual(before);

      await expect(root).toBeFocused();
      await expect
        .poll(() => editor.get.selection())
        .toMatchObject({
          anchor: {
            path: [start === 'empty paragraph' ? 1 : 0, 0],
            offset: start === 'empty paragraph' ? 0 : 7,
          },
          focus: {
            path: [start === 'empty paragraph' ? 1 : 0, 0],
            offset: start === 'empty paragraph' ? 0 : 7,
          },
        });
      await page.keyboard.press('ControlOrMeta+j');
      await page
        .getByRole('option', { name: 'Continue writing', exact: true })
        .click();
      await expect(page.getByRole('option', { name: 'Accept' })).toBeVisible();
      await expect(root.locator('[data-editor-ai-preview]')).toHaveText(
        'AI can help turn an initial idea into a clear and useful first draft.'
      );
      await expect(root.locator('[data-editor-retained]')).toHaveCount(0);
      await page.screenshot({
        path: testInfo.outputPath('complete-continuation.png'),
      });
      await page.getByRole('option', { name: 'Accept', exact: true }).click();
      await expect(root.locator('[data-editor-authored-change]')).toHaveCount(
        0
      );
      await page.keyboard.insertText('!');
      await expect(root.locator('[data-editor-path="1"]')).toHaveText(
        'AI can help turn an initial idea into a clear and useful first draft.!'
      );
      await page.keyboard.press('ControlOrMeta+z');
      await expect(root.locator('[data-editor-path="1"]')).toHaveText(
        'AI can help turn an initial idea into a clear and useful first draft.'
      );
      errors.assertNone();
      await expect(root).toBeFocused();
      await page.keyboard.press('ControlOrMeta+z');
      errors.assertNone();
      await expect.poll(() => editor.get.modelBlockTexts()).toEqual(before);
      for (let step = 0; step < 2; step++) {
        await page.keyboard.press('ControlOrMeta+Shift+z');
      }
      await expect(root.locator('[data-editor-path="1"]')).toHaveText(
        'AI can help turn an initial idea into a clear and useful first draft.!'
      );
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}

for (const dismissal of ['Escape', 'editor click'] as const) {
  test(`leaving unaccepted AI output with ${dismissal} discards the preview`, async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page);
    try {
      await page.goto('/docs/ai', { waitUntil: 'commit' });
      const root = page
        .locator('.editor-editor[contenteditable="true"]')
        .first();
      const editor = createBrowserEditorHarness(page, 'ai:dismissal', root);
      await editor.ready({ editor: 'visible', text: 'AI Menu' });
      await editor.dom.clickTextOffset({ path: [0, 0], offset: 7 });
      await page.keyboard.press('Enter');
      const before = await editor.get.modelBlockTexts();
      await page.keyboard.press('Space');
      await page
        .getByRole('option', { name: 'Continue writing', exact: true })
        .click();
      await expect(
        page.getByRole('option', { name: 'Accept', exact: true })
      ).toBeVisible();
      await expect(root.locator('[data-editor-ai-preview]')).toContainText(
        'AI can help'
      );

      if (dismissal === 'Escape') await page.keyboard.press('Escape');
      else await editor.dom.clickTextOffset({ path: [2, 0], offset: 8 });

      await expect(root.locator('[data-editor-ai-preview]')).toHaveCount(0);
      await expect(
        page.getByRole('option', { name: 'Accept', exact: true })
      ).toHaveCount(0);
      await expect.poll(() => editor.get.modelBlockTexts()).toEqual(before);
      await expect(root).toBeFocused();
      await expect
        .poll(() => editor.get.selection())
        .toMatchObject({
          anchor: {
            path: [dismissal === 'Escape' ? 1 : 2, 0],
            offset: dismissal === 'Escape' ? 0 : 8,
          },
          focus: {
            path: [dismissal === 'Escape' ? 1 : 2, 0],
            offset: dismissal === 'Escape' ? 0 : 8,
          },
        });
      await page.keyboard.type('!');
      await expect(root).toContainText(
        dismissal === 'Escape' ? '!' : 'Generate! and refine'
      );
      await page.keyboard.press('ControlOrMeta+z');
      await expect.poll(() => editor.get.modelBlockTexts()).toEqual(before);
      await expect(root.locator('[data-editor-ai-preview]')).toHaveCount(0);
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}

test('Generate Markdown sample keeps its review visible and accepts a usable table', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    await page.setViewportSize({ height: 890, width: 1010 });
    await page.goto('/docs/components/ai-menu', { waitUntil: 'commit' });
    const root = page.locator('.editor-editor[contenteditable="true"]').first();
    const editor = createBrowserEditorHarness(page, 'ai:markdown-scroll', root);
    await editor.ready({
      editor: 'visible',
      text: 'Press space in an empty block. Try it out:',
    });
    const before = await editor.get.modelBlockTexts();
    const frame = root.locator(
      'xpath=ancestor::*[@data-slot="editor-frame"][1]'
    );

    await expect(frame).toHaveCount(1);

    await editor.selection.collapse({ path: [7, 0], offset: 0 });
    await root.press('Space');
    const outerScrollBefore = await page.evaluate(() => window.scrollY);
    await page
      .getByRole('option', { name: 'Generate Markdown sample', exact: true })
      .click();

    await expect(page.getByRole('option', { name: 'Accept' })).toBeVisible();
    await expect(root).toContainText('Row 2');
    await expect.poll(() => editor.get.modelBlockTexts()).toEqual(before);
    await expect
      .poll(() =>
        frame.evaluate((element) => {
          const toolbar = element.querySelector<HTMLElement>(
            ':scope > [data-slot="fixed-toolbar"]'
          );
          const scrollport = element.querySelector<HTMLElement>(
            ':scope > [data-slot="editor-container"]'
          );

          if (!toolbar || !scrollport) return null;

          const frameBounds = element.getBoundingClientRect();
          const toolbarBounds = toolbar.getBoundingClientRect();
          const scrollportBounds = scrollport.getBoundingClientRect();

          return {
            bounded: scrollportBounds.bottom <= frameBounds.bottom + 1,
            separate: toolbarBounds.bottom <= scrollportBounds.top + 1,
            scrollable: scrollport.scrollHeight > scrollport.clientHeight,
          };
        })
      )
      .toEqual({ bounded: true, scrollable: true, separate: true });
    await expect
      .poll(() =>
        root
          .locator('[data-editor-ai-end]')
          .last()
          .evaluate((target) => {
            const scrollport = target.closest<HTMLElement>(
              '[data-slot="editor-container"]'
            );

            if (!scrollport) return null;

            const scrollportBounds = scrollport.getBoundingClientRect();
            const targetBounds = target.getBoundingClientRect();

            return {
              bottom: targetBounds.bottom <= scrollportBounds.bottom,
              top: targetBounds.top >= scrollportBounds.top,
            };
          })
      )
      .toEqual({ bottom: true, top: true });
    await expect
      .poll(() =>
        root.evaluate((editable) => {
          const scrollport = editable.closest<HTMLElement>(
            '[data-slot="editor-container"]'
          );

          const accept = Array.from(
            document.querySelectorAll<HTMLElement>('[role="option"]')
          ).find((option) => option.textContent?.trim() === 'Accept');
          const menu = accept?.closest<HTMLElement>('[data-slot="command"]');

          if (!menu || !scrollport) return null;

          const menuBounds = menu.getBoundingClientRect();
          const scrollportBounds = scrollport.getBoundingClientRect();

          return {
            bottom: menuBounds.bottom <= scrollportBounds.bottom,
            left: menuBounds.left >= scrollportBounds.left,
            right: menuBounds.right <= scrollportBounds.right,
            top: menuBounds.top >= scrollportBounds.top,
          };
        })
      )
      .toEqual({ bottom: true, left: true, right: true, top: true });
    expect(
      Math.abs((await page.evaluate(() => window.scrollY)) - outerScrollBefore)
    ).toBeLessThanOrEqual(1);
    await page.keyboard.press('Enter');
    const acceptedTable = root.locator('table').filter({ hasText: 'Header 1' });

    await expect(acceptedTable).toHaveCount(1);
    await expect
      .poll(() =>
        acceptedTable.evaluate((table) => {
          const cells = Array.from(
            table.querySelectorAll<HTMLElement>(
              'tr:first-child > th, tr:first-child > td'
            )
          );

          return {
            cellWidths: cells.map((cell) => cell.getBoundingClientRect().width),
            tableWidth: table.getBoundingClientRect().width,
          };
        })
      )
      .toEqual({ cellWidths: [8, 300, 300], tableWidth: 608 });
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('full Generate MDX sample remains responsive through streaming', async ({
  page,
}, testInfo) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/ai-demo', { waitUntil: 'commit' });
    const root = page.locator('.editor-editor[contenteditable="true"]').first();
    const editor = createBrowserEditorHarness(page, 'ai:mdx-preset', root);
    await editor.ready({
      editor: 'visible',
      text: 'Press space in an empty block. Try it out:',
    });
    await page.evaluate(() => {
      const probe = { lastFrame: performance.now(), maxFrameGap: 0 };
      (
        window as typeof window & {
          __aiStreamProbe?: typeof probe;
        }
      ).__aiStreamProbe = probe;

      const tick = (now: number) => {
        probe.maxFrameGap = Math.max(probe.maxFrameGap, now - probe.lastFrame);
        probe.lastFrame = now;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await editor.selection.collapse({ path: [7, 0], offset: 0 });
    await root.press('Space');
    const startedAt = Date.now();
    await page
      .getByRole('option', { name: 'Generate MDX sample', exact: true })
      .click();

    await expect(root).toContainText('Basic Markdown');
    await expect(root.locator('[data-editor-authored-change]')).toHaveCount(0);
    await expect
      .poll(() =>
        root
          .locator('[data-editor-ai-end]')
          .last()
          .evaluate((el) => ({
            content: getComputedStyle(el, '::after').content,
            width: getComputedStyle(el, '::after').width,
          }))
      )
      .toEqual({ content: '""', width: '12px' });
    await expect(root).toContainText('Advanced Features');
    await expect(root).toContainText('Video playback features support');
    await expect(page.getByRole('option', { name: 'Accept' })).toBeVisible();
    const maxFrameGap = await page.evaluate(
      () =>
        (
          window as typeof window & {
            __aiStreamProbe?: { maxFrameGap: number };
          }
        ).__aiStreamProbe?.maxFrameGap ?? Number.POSITIVE_INFINITY
    );
    const metrics = JSON.stringify({
      elapsedMs: Date.now() - startedAt,
      maxFrameGap,
    });
    await writeFile(testInfo.outputPath('stream-performance.json'), metrics);
    await testInfo.attach('stream-performance', {
      body: metrics,
      contentType: 'application/json',
    });
    expect(maxFrameGap).toBeLessThan(1500);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
