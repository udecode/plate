import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { recordBrowserRuntimeErrors } from '@platejs/test/playwright';
import { expect, test, type Page } from '@playwright/test';
import JSZip from 'jszip';

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

test('the export menu applies one suggestion projection to every format', async ({
  context,
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const errors = recordBrowserRuntimeErrors(page);
  const marker = ' ZZSUGGESTED';
  const exportButton = page.getByRole('button', { name: 'Export' });

  const downloadExport = async (
    name: 'Export as HTML' | 'Export as Markdown' | 'Export as Word',
    filename: string,
    projection?: 'Exclude suggested changes'
  ) => {
    const item = page.getByRole('menuitem', { exact: true, name });

    if (!(await item.isVisible())) {
      await expect(exportButton).toHaveAttribute('aria-expanded', 'false');
      await exportButton.click();
      await expect(item).toBeVisible();
    }
    if (projection) {
      const projectionItem = page.getByRole('menuitemradio', {
        name: projection,
      });

      if ((await projectionItem.getAttribute('aria-checked')) !== 'true') {
        await projectionItem.click();
      }
    }
    const download = page.waitForEvent('download', { timeout: 30_000 });

    await item.click();
    const artifact = await download;
    const path = testInfo.outputPath(filename);

    await artifact.saveAs(path);

    return path;
  };

  const createSuggestion = async () => {
    const editor = await openDocxDemo(page);

    await page.getByRole('button', { name: 'Editing' }).click();
    await page.getByRole('menuitemradio', { name: 'Suggestion' }).click();
    await editor.evaluate((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let text: Text | null = null;

      while (walker.nextNode()) text = walker.currentNode as Text;
      if (!text) throw new Error('The DOCX editor has no text node.');

      const selection = window.getSelection();
      const range = document.createRange();

      range.setStart(text, text.length);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
      (element as HTMLElement).focus();
    });
    await page.keyboard.type(marker);

    const authoredMarker = page.locator('[data-editor-authored-change]', {
      hasText: marker,
    });

    await expect(authoredMarker).toHaveCount(1);
    await expect(authoredMarker).toHaveText(marker);
  };

  try {
    await createSuggestion();

    await page.getByRole('button', { name: 'Export' }).click();
    await expect(
      page.getByRole('menuitemradio', { name: 'Include suggested changes' })
    ).toBeChecked();
    await expect(
      page.getByRole('menuitemradio', { name: 'Exclude suggested changes' })
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Export as PDF' })
    ).toHaveCount(0);
    await expect(
      page.getByRole('menuitem', { name: 'Export as Image' })
    ).toHaveCount(0);

    const htmlPath = await downloadExport('Export as HTML', 'included.html');
    const html = await readFile(htmlPath, 'utf-8');

    expect(html).toContain(marker);
    expect(html).toContain('<style>');
    expect(html).not.toContain('platejs.org');
    expect(html).not.toContain('fonts.googleapis.com');

    await expect(exportButton).toHaveAttribute('aria-expanded', 'false');
    await exportButton.click();
    await expect(
      page.getByRole('menuitem', { name: 'Export as HTML' })
    ).toBeVisible();

    const exportedHtml = await context.newPage();

    await exportedHtml.goto(pathToFileURL(htmlPath).href);
    await expect(exportedHtml.locator('body')).toContainText(marker.trim());
    await exportedHtml.close();

    const markdownPath = await downloadExport(
      'Export as Markdown',
      'excluded.md',
      'Exclude suggested changes'
    );
    expect(await readFile(markdownPath, 'utf-8')).not.toContain(marker.trim());

    await createSuggestion();
    const cleanWordPath = await downloadExport(
      'Export as Word',
      'excluded.docx',
      'Exclude suggested changes'
    );
    const cleanWord = await JSZip.loadAsync(await readFile(cleanWordPath));
    const cleanXml = await cleanWord.file('word/document.xml')!.async('string');

    expect(cleanXml).not.toContain(marker.trim());

    await createSuggestion();
    await expect(exportButton).toHaveAttribute('aria-expanded', 'false');
    await exportButton.click();
    const trackedDownload = page.waitForEvent('download', { timeout: 30_000 });

    await page
      .getByRole('menuitem', { name: 'Export as Word with tracked changes' })
      .click();
    const trackedArtifact = await trackedDownload;
    const trackedPath = testInfo.outputPath('tracked.docx');

    await trackedArtifact.saveAs(trackedPath);
    const trackedWord = await JSZip.loadAsync(await readFile(trackedPath));
    const trackedXml = await trackedWord
      .file('word/document.xml')!
      .async('string');
    const markerRevisions = [
      ...trackedXml.matchAll(/<w:ins\b[\s\S]*?<\/w:ins>/g),
    ].filter(([revision]) => revision.includes(marker.trim()));

    expect(markerRevisions).toHaveLength(1);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('the export menu exports interactive blocks to HTML and Word', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const errors = recordBrowserRuntimeErrors(page);
  const exportButton = page.getByRole('button', { name: 'Export' });

  const downloadExport = async (
    name: 'Export as HTML' | 'Export as Word',
    filename: string
  ) => {
    await expect(exportButton).toHaveAttribute('aria-expanded', 'false');
    await exportButton.click();
    const download = page.waitForEvent('download', { timeout: 30_000 });

    await page.getByRole('menuitem', { exact: true, name }).click();
    const artifact = await download;
    const path = testInfo.outputPath(filename);

    await artifact.saveAs(path);

    return path;
  };
  const readDocumentXml = async (path: string) => {
    const word = await JSZip.loadAsync(await readFile(path));

    return word.file('word/document.xml')!.async('string');
  };

  try {
    const editor = await openDocxDemo(page);
    const startNewBlock = async () => {
      await editor.click();
      await page.keyboard.press(
        process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End'
      );
      await page.keyboard.press('Enter');
    };
    const slashInsert = async (query: string, text: string) => {
      await startNewBlock();
      await page.keyboard.type(`/${query}`);
      await page.keyboard.press('Enter');
      await page.keyboard.type(text);
    };

    await slashInsert('to-do', 'TASK-ITEM');
    await slashInsert('callout', 'CALLOUT-TEXT');
    await slashInsert('code block', 'CODE-TEXT');
    await startNewBlock();
    page.once('dialog', (dialog) =>
      dialog.accept('https://platejs.org/og.png')
    );
    await page.locator('button:has(svg.lucide-plus)').first().click();
    await page.getByRole('menuitem', { exact: true, name: 'Image' }).click();
    await slashInsert('3 columns', 'COLUMN-TEXT');
    await slashInsert('table', 'TABLE-CELL');

    const html = await readFile(
      await downloadExport('Export as HTML', 'blocks.html'),
      'utf-8'
    );

    for (const text of [
      'TASK-ITEM',
      'CALLOUT-TEXT',
      'CODE-TEXT',
      'COLUMN-TEXT',
      'TABLE-CELL',
      'https://platejs.org/og.png',
      '<table',
    ]) {
      expect(html).toContain(text);
    }

    const wordXml = await readDocumentXml(
      await downloadExport('Export as Word', 'blocks.docx')
    );

    for (const text of [
      'TASK-ITEM',
      'CALLOUT-TEXT',
      'CODE-TEXT',
      'COLUMN-TEXT',
      'TABLE-CELL',
      '<w:tbl>',
    ]) {
      expect(wordXml).toContain(text);
    }

    await editor
      .locator('table [data-editor-string]', { hasText: 'TABLE-CELL' })
      .selectText();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type(' EDITED');
    await expect(editor.locator('table')).toContainText('TABLE-CELL EDITED');
    const task = editor.getByRole('checkbox').first();

    await task.click();
    await expect(task).toBeChecked();
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
