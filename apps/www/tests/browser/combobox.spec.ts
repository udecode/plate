import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const EDITOR_ROOT = '[data-plite-editor="true"][contenteditable="true"]';

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
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      await page.goto(combobox.route, { waitUntil: 'commit' });

      const root = page.locator(EDITOR_ROOT).first();
      const editor = createPliteBrowserEditorHarness(
        page,
        combobox.caseId,
        root
      );

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
