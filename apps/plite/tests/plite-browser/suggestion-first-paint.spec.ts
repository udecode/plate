import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('paints the first typed character after restoring suggestions', async ({
  page,
}) => {
  const { errors } = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/suggestion-first-paint', { waitUntil: 'commit' });
  const root = page.getByRole('textbox', { name: 'Persisted suggestions' });
  const editor = createBrowserEditorHarness(
    page,
    'persisted suggestions',
    root
  );

  await editor.ready({ editor: 'visible' });
  await editor.assert.modelBlockText(0, 'Before React. capabilities');
  await editor.selection.collapse({ path: [0, 2], offset: 2 });
  await editor.focus();
  const capturePaint = () =>
    root.evaluate(async (element) => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      const editorRoot = element as HTMLElement & {
        __pliteBrowserHandle?: {
          getBlockText: (index: number) => string | null;
        };
      };
      const block = editorRoot.querySelector<HTMLElement>(
        '[data-editor-node="element"]'
      );

      return {
        model: editorRoot.__pliteBrowserHandle?.getBlockText(0) ?? null,
        spans: [
          ...(block?.querySelectorAll('[data-editor-authored-kind="insert"]') ??
            []),
        ].map((node) => node.textContent ?? ''),
        text: block?.textContent ?? '',
      };
    });

  await page.keyboard.type('w');
  const firstPaint = await capturePaint();

  expect(firstPaint).toMatchObject({
    model: 'Before React. wcapabilities',
    spans: ['w'],
  });
  expect(firstPaint.text).toContain('. wcapabilities');

  await page.keyboard.type('w');
  const secondPaint = await capturePaint();

  expect(secondPaint).toMatchObject({
    model: 'Before React. wwcapabilities',
    spans: ['w', 'w'],
  });
  expect(secondPaint.text).toContain('. wwcapabilities');
  expect(errors).toEqual([]);
});
