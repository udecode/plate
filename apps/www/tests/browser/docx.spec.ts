import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { recordBrowserRuntimeErrors } from '@platejs/test/playwright';
import { expect, test, type Page } from '@playwright/test';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const openDocxDemo = async (page: Page) => {
  await page.goto('/blocks/docx-demo', { waitUntil: 'networkidle' });
  const editor = page.locator('[data-editor="true"]').first();

  await expect(editor).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Import' })).toBeVisible({
    timeout: 30_000,
  });

  return editor;
};

const chooseWordFile = async (
  page: Page,
  file: Readonly<{ buffer: Buffer; name: string }>
) => {
  await page.getByRole('button', { name: 'Import' }).click();
  const chooser = page.waitForEvent('filechooser');

  await page.getByRole('menuitem', { name: 'Import from Word' }).click();
  const fileChooser = await chooser;

  await fileChooser.setFiles({ ...file, mimeType: DOCX_MIME });
};

test('an invalid Word file leaves the editor unchanged', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const editor = await openDocxDemo(page);
    const initialText = await editor.innerText();

    await chooseWordFile(page, {
      buffer: Buffer.from('not a zip package'),
      name: 'invalid.docx',
    });
    // use-file-picker does not expose the async selection callback promise.
    await page.waitForTimeout(500);
    expect(await editor.innerText()).toBe(initialText);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('a Word file imports and exports through the toolbar', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const editor = await openDocxDemo(page);
    const input = await readFile(
      resolve('src/__tests__/package-integration/docx/headers.docx')
    );

    await chooseWordFile(page, {
      buffer: input,
      name: 'headers.docx',
    });
    await expect(editor).toContainText('A Test of Headers', {
      timeout: 20_000,
    });

    await page.getByRole('button', { name: 'Export' }).click();
    const download = page.waitForEvent('download');

    await page.getByRole('menuitem', { name: 'Export as Word' }).click();
    const artifact = await download;
    const path = await artifact.path();

    expect(artifact.suggestedFilename()).toBe('plate.docx');
    expect(path).not.toBeNull();
    const bytes = await readFile(path);

    expect(bytes).toEqual(input);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
