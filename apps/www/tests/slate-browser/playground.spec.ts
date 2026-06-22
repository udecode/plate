import { expect, test } from '@playwright/test';
import {
  createSlateBrowserEditorHarness,
  recordSlateBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

type PlatePlaywrightWindow = Window & {
  platePlaywrightAdapter?: unknown;
};

type SlateBrowserHandleElement = HTMLElement & {
  __slateBrowserHandle?: {
    getText?: unknown;
  };
};

test.describe('Plate playground Slate bridge', () => {
  test('playground edits through the Slate browser handle adapter', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      await page.goto('/blocks/playground', { waitUntil: 'commit' });

      const root = page.locator('[data-slate-editor="true"]').first();

      await expect(root).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              typeof (window as PlatePlaywrightWindow).platePlaywrightAdapter
          )
        )
        .toBe('object');

      await expect
        .poll(() =>
          root.evaluate(
            (element) =>
              typeof (element as SlateBrowserHandleElement)
                .__slateBrowserHandle?.getText
          )
        )
        .toBe('function');

      const editor = createSlateBrowserEditorHarness(
        page,
        'plate-playground',
        root
      );
      const insertedText = ' playground slate bridge proof';

      await root.click();
      await page.keyboard.press('End');
      await editor.insertText(insertedText);

      await expect(root).toContainText(insertedText);
      await expect.poll(() => editor.get.modelText()).toContain(insertedText);

      await editor.undo();
      await expect
        .poll(() => editor.get.modelText())
        .not.toContain(insertedText);
      await expect
        .poll(async () => {
          const history = await editor.get.history();

          return Array.isArray((history as { redos?: unknown[] } | null)?.redos)
            ? (history as { redos: unknown[] }).redos.length
            : 0;
        })
        .toBeGreaterThan(0);

      await editor.redo();
      await expect.poll(() => editor.get.modelText()).toContain(insertedText);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
