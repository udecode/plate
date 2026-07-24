import { expect, test } from '@playwright/test';
import {
  createPliteBrowserEditorHarness,
  openExample,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

test('compiles Plate element and mark descriptors into HTML parsing, rendering, and Markdown clipboard bindings', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');

  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openExample(page, 'plite/plate-schema-descriptors', {
      ready: { editor: 'visible' },
    });

    const editor = createPliteBrowserEditorHarness(
      page,
      'plate-schema-descriptor',
      page.locator('#plate-schema-descriptor-editor')
    );

    await page
      .getByRole('button', { name: 'Import Plate descriptor HTML' })
      .click();

    await expect
      .poll(async () =>
        JSON.parse(
          (await page.getByTestId('plate-schema-document').textContent()) ??
            'null'
        )
      )
      .toEqual([
        {
          children: [
            {
              bold: true,
              fontSize: '22px',
              schemaAdvanced: 'proof',
              text: 'Descriptor proof',
            },
          ],
          id: expect.any(String),
          type: 'p',
        },
      ]);
    await expect(page.getByTestId('plate-schema-descriptor-policy')).toHaveText(
      'string:false:preserve:preserve-if-allowed'
    );
    await expect(editor.root.locator('article')).toHaveCount(1);
    await expect(editor.root.locator('strong')).toHaveText('Descriptor proof');
    await expect(editor.root.locator('mark')).toHaveText('Descriptor proof');
    await expect(editor.root.locator('.plite-fontSize')).toHaveText(
      'Descriptor proof'
    );
    await expect(editor.root.locator('.plite-fontSize')).toHaveCSS(
      'font-size',
      '22px'
    );

    await editor.selection.selectDOM({
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'Descriptor proof'.length },
    });

    const payload = await editor.clipboard.copyNativeEventPayload();

    expect(payload.types).toEqual(
      expect.arrayContaining([
        'application/x-plite-fragment',
        'text/html',
        'text/markdown',
        'text/plain',
      ])
    );
    expect(payload.html).toContain('data-plite-fragment=');
    expect(payload.markdown).toBe('**Descriptor proof**\n');
    expect(payload.text).toBe('Descriptor proof');

    await editor.clipboard.pasteNativeText('**Markdown fallback**');

    await expect(editor.root.locator('strong')).toHaveText('Markdown fallback');
    await expect.poll(() => editor.get.modelText()).toBe('Markdown fallback');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
