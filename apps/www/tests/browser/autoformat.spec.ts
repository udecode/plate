import {
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';
import type { Page } from '@playwright/test';

const CASE_ID = 'autoformat:text-substitution-native-input';
const INTRO_TEXT =
  'Empower your writing experience by enabling autoformatting features. Add Markdown-like shortcuts that automatically apply formatting as you type.';
const ROUTE = '/blocks/autoformat-demo';

const openEmptyParagraph = async (page: Page, caseId: string) => {
  await page.goto(ROUTE, { waitUntil: 'commit' });

  const root = page
    .locator('[data-editor="true"][contenteditable="true"]')
    .first();
  const editor = createBrowserEditorHarness(page, caseId, root);

  await editor.ready({ editor: 'visible', text: INTRO_TEXT });
  await editor.selection.collapse({
    offset: INTRO_TEXT.length,
    path: [1, 0],
  });
  await editor.focus();
  await page.keyboard.press('Enter');
  await editor.assert.modelBlockText(2, '');

  return { editor, root };
};

test(CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto(ROUTE, { waitUntil: 'commit' });

    const root = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const editor = createBrowserEditorHarness(page, CASE_ID, root);

    await editor.ready({ editor: 'visible', text: INTRO_TEXT });

    const blockTexts = await editor.get.modelBlockTexts();
    const blockIndex = blockTexts.indexOf(INTRO_TEXT);

    expect(blockIndex).toBeGreaterThanOrEqual(0);

    const path = [blockIndex, 0];
    const initialOffset = INTRO_TEXT.length;

    await editor.selection.collapse({ offset: initialOffset, path });
    await editor.focus();
    await editor.assert.collapsedModelDOMSelection({
      offset: initialOffset,
      path,
      text: INTRO_TEXT,
    });
    await editor.assert.focusOwner('editor');

    await page.keyboard.type(' ->');

    const substitutedText = `${INTRO_TEXT} →`;

    await editor.assert.modelBlockText(blockIndex, substitutedText);
    await expect(
      root.locator('[data-editor-node="element"]').nth(blockIndex)
    ).toContainText(substitutedText);
    await editor.assert.collapsedModelDOMSelection({
      offset: substitutedText.length,
      path,
      text: substitutedText,
    });
    await editor.assert.focusOwner('editor');

    await page.keyboard.type('x');

    const finalText = `${substitutedText}x`;

    await editor.assert.modelBlockText(blockIndex, finalText);
    await expect(
      root.locator('[data-editor-node="element"]').nth(blockIndex)
    ).toContainText(finalText);
    await editor.assert.collapsedModelDOMSelection({
      offset: finalText.length,
      path,
      text: finalText,
    });
    await editor.assert.focusOwner('editor');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

for (const { name, prefix, expected } of [
  { name: 'heading', prefix: '# ', expected: { level: 1, type: 'heading' } },
  {
    name: 'list',
    prefix: '- ',
    expected: { listType: 'bulleted', type: 'paragraph' },
  },
  { name: 'code fence', prefix: '```', expected: { type: 'codeBlock' } },
]) {
  test(`autoformat:native-${name}`, async ({ page }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { editor } = await openEmptyParagraph(page, `autoformat:${name}`);

      await page.keyboard.type(prefix);

      await expect
        .poll(async () => {
          const value = (await editor.get.modelValue()) as {
            children: Array<{
              level?: number;
              listType?: string;
              type: string;
            }>;
          };

          return value.children[2];
        })
        .toMatchObject(expected);
      await editor.assert.modelBlockText(2, '');
      await editor.assert.focusOwner('editor');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}

const openEmptyCodeBlock = async (page: Page, caseId: string) => {
  const opened = await openEmptyParagraph(page, caseId);

  await page.keyboard.type('```');
  await expect
    .poll(async () => {
      const value = (await opened.editor.get.modelValue()) as {
        children: Array<{ type: string }>;
      };

      return value.children[2]?.type;
    })
    .toBe('codeBlock');

  return opened;
};

test('autoformat:native-code-block-keeps-shortcuts', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor } = await openEmptyCodeBlock(page, 'autoformat:code-keys');

    await page.keyboard.type('# **x**');

    await editor.assert.modelBlockText(2, '# **x**');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: unknown[]; type: string }>;
        };

        return value.children[2];
      })
      .toEqual({ children: [{ text: '# **x**' }], type: 'codeBlock' });
    await editor.assert.focusOwner('editor');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('autoformat:native-code-block-plain-paste', async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor } = await openEmptyCodeBlock(page, 'autoformat:code-paste');

    await editor.clipboard.pasteText('a **b** c');

    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: unknown[]; type: string }>;
        };

        return value.children[2];
      })
      .toEqual({ children: [{ text: 'a **b** c' }], type: 'codeBlock' });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('autoformat:native-divider', async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor } = await openEmptyParagraph(page, 'autoformat:divider');

    await page.keyboard.type('---');

    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: unknown[]; type: string }>;
        };

        return value.children.slice(2, 4);
      })
      .toEqual([
        { children: [{ text: '' }], type: 'horizontalRule' },
        { children: [{ text: '' }], type: 'paragraph' },
      ]);

    await page.keyboard.type('x');

    await editor.assert.modelBlockText(3, 'x');
    await editor.assert.focusOwner('editor');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('autoformat:native-inline-and-block-math', async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor } = await openEmptyParagraph(page, 'autoformat:math');

    await page.keyboard.type('$x$');

    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{
            children: Array<{ latex?: string; type?: string }>;
          }>;
        };

        return value.children[2]?.children;
      })
      .toContainEqual(
        expect.objectContaining({ latex: 'x', type: 'inlineEquation' })
      );

    await page.keyboard.press('Enter');
    await editor.assert.modelBlockText(3, '');
    await page.keyboard.type('$$');
    await page.keyboard.press('Enter');

    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ latex?: string; type: string }>;
        };

        return value.children[3];
      })
      .toMatchObject({ latex: '', type: 'equation' });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

for (const variant of ['space', 'Enter', 'paste'] as const) {
  test(`autoformat:native-autolink-${variant}`, async ({ page }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page);
    const url = 'https://platejs.org';

    try {
      const { editor } = await openEmptyParagraph(
        page,
        `autoformat:autolink-${variant}`
      );

      if (variant === 'paste') {
        await editor.clipboard.pasteEventPayload({ text: url });
      } else {
        await page.keyboard.type(url);
        await page.keyboard.press(variant === 'space' ? 'Space' : 'Enter');
      }

      await expect
        .poll(async () => {
          const value = (await editor.get.modelValue()) as {
            children: Array<{
              children: Array<{ type?: string; url?: string }>;
            }>;
          };

          return value.children[2]?.children;
        })
        .toContainEqual(expect.objectContaining({ type: 'link', url }));
      if (variant === 'space') {
        await editor.assert.modelBlockText(2, `${url} `);
        await page.keyboard.type('x');
        await editor.assert.modelBlockText(2, `${url} x`);
        await editor.assert.modelBlockText(
          3,
          'While typing, try these mark rules:'
        );
      }
      await editor.assert.focusOwner('editor');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}
