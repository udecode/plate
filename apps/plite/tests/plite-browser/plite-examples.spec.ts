import { expect, test } from '@playwright/test';
import {
  attachPageScreenshot,
  openExample,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

const pliteExampleIds = [
  'plaintext',
  'richtext',
  'markdown-shortcuts',
  'editable-voids',
  'custom-placeholder',
  'hidden-content-blocks',
  'huge-document',
] as const;

type PliteExampleId = (typeof pliteExampleIds)[number];

const expectedText: Record<PliteExampleId, RegExp | string> = {
  'custom-placeholder': '',
  'editable-voids':
    'In addition to nodes that contain editable text, you can insert void nodes',
  'hidden-content-blocks': 'Intro visible before hidden blocks.',
  'huge-document': /[A-Za-z]/,
  'markdown-shortcuts': 'The editor gives you full control over the logic',
  plaintext: 'This is editable plain text',
  richtext: 'This is editable rich text',
};

const openPliteExample = async (
  page: Parameters<typeof openExample>[0],
  id: PliteExampleId,
  readyText: RegExp | string = expectedText[id]
) =>
  openExample(page, `plite/${id}`, {
    ready: {
      editor: 'visible',
      ...(readyText ? { text: readyText } : {}),
    },
  });

const getHistoryHotkeys = async (page: Parameters<typeof openExample>[0]) => {
  const isMac = await page.evaluate(() => /Mac OS X/.test(navigator.userAgent));

  return {
    redo: isMac ? 'Meta+Shift+Z' : 'Control+Shift+Z',
    undo: isMac ? 'Meta+Z' : 'Control+Z',
  };
};

test.describe('Plite app example routes', () => {
  for (const id of pliteExampleIds) {
    test(`${id} loads with Plite browser handle`, async ({ page }) => {
      const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

      try {
        const editor = await openPliteExample(page, id);

        await expect(editor.root).toHaveAttribute('data-plite-editor', 'true');
        await expect
          .poll(() =>
            editor.root.evaluate(
              (element) => typeof (element as any).__pliteBrowserHandle
            )
          )
          .toBe('object');

        const modelText = await editor.get.modelText();
        const expected = expectedText[id];

        if (expected) {
          if (expected instanceof RegExp) {
            expect(modelText).toMatch(expected);
          } else {
            expect(modelText).toContain(expected);
          }
        } else {
          expect(modelText).toBe('');
        }

        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });
  }

  test('plaintext typing keeps DOM and model text in sync', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openPliteExample(page, 'plaintext');
      const insertedText = ' checkpoint proof';

      await editor.click();
      await editor.press('End');
      await page.keyboard.type(insertedText);

      await expect(editor.root).toContainText(insertedText);
      await expect.poll(() => editor.get.modelText()).toContain(insertedText);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('richtext route supports undo and redo after typing', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openPliteExample(page, 'richtext');
      const hotkeys = await getHistoryHotkeys(page);
      const insertedText = ' history proof';

      await editor.click();
      await editor.press('End');
      await page.keyboard.type(insertedText);
      await expect.poll(() => editor.get.modelText()).toContain(insertedText);

      await editor.press(hotkeys.undo);
      await expect
        .poll(() => editor.get.modelText())
        .not.toContain(insertedText);

      await editor.press(hotkeys.redo);
      await expect.poll(() => editor.get.modelText()).toContain(insertedText);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('richtext route keeps native and model selections aligned', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openPliteExample(page, 'richtext');
      const focusOffset = 'This is editable'.length;

      await editor.selection.selectDOM({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: focusOffset },
      });

      await expect
        .poll(() => editor.get.selectedText())
        .toBe('This is editable');
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString()))
        .toBe('This is editable');
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: focusOffset },
      });
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('custom placeholder shows for empty content and hides after typing', async ({
    page,
  }, testInfo) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'plite/custom-placeholder', {
        ready: {
          editor: 'visible',
          placeholder: 'visible',
        },
      });

      if (testInfo.project.name === 'mobile') {
        await editor.selection.select({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });
        await editor.insertText('placeholder proof');
      } else {
        await editor.click();
        await page.keyboard.type('placeholder proof');
      }

      await editor.assert.placeholderVisible(false);
      await expect.poll(() => editor.get.modelText()).toBe('placeholder proof');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('editable void and hidden content routes keep surrounding model text', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      const editableVoids = await openPliteExample(page, 'editable-voids');
      await expect(
        editableVoids.root.locator('[data-plite-void="true"]')
      ).toHaveCount(1);
      await expect
        .poll(() => editableVoids.get.modelText())
        .toContain('The editable void above stores its body in an extra root.');

      const hiddenDom = await openPliteExample(page, 'hidden-content-blocks');
      await expect(hiddenDom.root).toContainText(
        'Intro visible before hidden blocks.'
      );
      await expect
        .poll(() => hiddenDom.get.modelText())
        .toContain('Outro visible after hidden blocks.');

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('huge document route renders, scrolls, types, and captures visual proof', async ({
    page,
  }, testInfo) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(
        page,
        'plite/huge-document?blocks=100&strategy=staged',
        {
          ready: {
            editor: 'visible',
            text: /[A-Za-z]/,
          },
        }
      );

      await expect(
        page.locator('[data-test-id="huge-document-mounted-top-level-count"]')
      ).toBeVisible();
      await editor.root.evaluate((element: HTMLElement) => {
        element.scrollTop = element.scrollHeight;
      });

      await editor.root.locator('p').first().click();
      await editor.press('End');
      await page.keyboard.type(' huge proof');

      await expect.poll(() => editor.get.modelText()).toContain('huge proof');
      await attachPageScreenshot(
        page,
        testInfo,
        'plite-huge-document-proof.png',
        {
          fullPage: false,
        }
      );
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
