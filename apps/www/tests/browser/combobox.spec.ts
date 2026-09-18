import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const EDITOR_ROOT = '[data-editor="true"][contenteditable="true"]';

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
      const slash = root.locator('input[role="combobox"]');
      await expect(slash).toHaveValue('AI');

      if (activation === 'Enter') await slash.press('Enter');
      else await page.getByRole('option', { name: 'AI', exact: true }).click();

      const prompt = page.getByPlaceholder('Ask AI anything...');
      await expect(prompt).toBeFocused();
      await expect(slash).toHaveCount(0);
      await editor.assert.modelBlockText(2, '');
      await editor.assert.selection({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      });
      const caret = page.locator('[data-editor-inactive-selection-caret]');
      await expect(caret).toHaveCount(1);
      const paragraph = root.locator(
        '[data-editor-node="element"][data-editor-path="2"]'
      );
      await expect
        .poll(async () => {
          const caretBox = await caret.boundingBox();
          const paragraphBox = await paragraph.boundingBox();

          return !!(
            caretBox &&
            paragraphBox &&
            caretBox.y >= paragraphBox.y &&
            caretBox.y + caretBox.height <=
              paragraphBox.y + paragraphBox.height + 1
          );
        })
        .toBe(true);
      await prompt.press('Escape');
      await expect(prompt).toHaveCount(0);
      await expect(root).toBeFocused();
      await editor.assert.collapsedModelDOMSelection({
        path: [2, 0],
        offset: 0,
        text: '',
      });
      await page.keyboard.type('Still here');
      await editor.assert.modelBlockText(2, 'Still here');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}

for (const combobox of [
  {
    caseId: 'combobox:mention-trigger',
    filteredOut: 'Aayla Secura',
    option: 'Biggs Darklighter',
    query: 'biggs',
    route: '/blocks/mention-demo',
    text: 'Mention',
    trigger: '@',
    transientType: 'mentionInput',
  },
  {
    caseId: 'combobox:slash-trigger',
    filteredOut: 'Text',
    option: 'Heading 1',
    query: 'h1',
    route: '/blocks/slash-command-demo',
    text: 'Slash Command',
    trigger: '/',
    transientType: 'slashInput',
  },
] as const) {
  test(combobox.caseId, async ({ page }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      await page.goto(combobox.route, { waitUntil: 'commit' });

      const root = page.locator(EDITOR_ROOT).first();
      const editor = createBrowserEditorHarness(page, combobox.caseId, root);

      await editor.ready({ editor: 'visible', text: combobox.text });
      await editor.selection.collapse({ offset: 0, path: [0, 0] });
      await editor.focus();
      await editor.assert.collapsedModelDOMSelection({
        offset: 0,
        path: [0, 0],
        text: combobox.text,
      });
      await page.keyboard.type(combobox.trigger);

      await expect
        .poll(() => editor.get.lastCommit())
        .toMatchObject({
          classifications: [expect.objectContaining({ structure: true })],
        });
      await expect
        .poll(async () => {
          const value = (await editor.get.modelValue()) as {
            children: Array<{ children?: Array<{ type?: string }> }>;
          };

          return value.children[0]?.children?.some(
            (node) => node.type === combobox.transientType
          );
        })
        .toBe(true);
      await expect(page.getByRole('option').first()).toBeVisible();
      await editor.assert.focusOwner('internal-control');
      await page.keyboard.type(combobox.query);
      const queryInput = page.getByRole('combobox');

      await expect(queryInput).toHaveValue(combobox.query);
      await expect(
        queryInput.locator('xpath=../span[@aria-hidden="true"]')
      ).toHaveText(combobox.query);
      await expect(
        page.getByRole('option', { exact: true, name: combobox.option })
      ).toBeVisible();
      await expect(
        page.getByRole('option', { exact: true, name: combobox.filteredOut })
      ).toHaveCount(0);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}
