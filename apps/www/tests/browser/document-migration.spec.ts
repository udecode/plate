import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('saves migrated JSON and reopens it without rerunning history', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/dev/document-migration', { waitUntil: 'commit' });
  const editor = page.getByRole('textbox', { name: 'Migrated document' });
  const harness = createBrowserEditorHarness(
    page,
    'document migration',
    editor
  );

  await harness.ready({
    editor: 'visible',
    text: 'Migrated automatically v53',
  });
  const insertAtStart = (text: string) =>
    editor.evaluate((element, value) => {
      (
        element as HTMLElement & {
          __pliteBrowserHandle: {
            insertTextAt: (
              text: string,
              point: { offset: number; path: number[] },
              policy: { tags: string[] }
            ) => void;
          };
        }
      ).__pliteBrowserHandle.insertTextAt(
        value,
        { offset: 0, path: [0, 0] },
        { tags: ['document-migration-proof'] }
      );
    }, text);

  await insertAtStart('saved marker ');
  await expect(editor).toContainText('saved marker');

  await page.getByRole('button', { name: 'Save JSON' }).click();
  await expect(page.getByTestId('saved-document-json')).toContainText(
    'saved marker'
  );
  await expect(page.getByTestId('saved-document-json')).toContainText(
    '"version":54'
  );

  await insertAtStart('unsaved marker ');
  await expect(editor).toContainText('unsaved marker');
  await page.getByRole('button', { name: 'Reopen saved JSON' }).click();

  await expect(editor).toContainText('saved marker');
  await expect(editor).not.toContainText('unsaved marker');
  await expect(
    page.getByText('Reopened current JSON with 0 historical steps.')
  ).toBeVisible();
  runtimeErrors.assertNone();
});
