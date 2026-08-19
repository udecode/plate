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
          type: 'paragraph',
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

    await page
      .getByRole('button', { name: 'Reset block codec target' })
      .click();
    await page.getByRole('button', { name: 'Import Markdown MIME' }).click();

    await expect(editor.root.locator('strong')).toHaveText('Markdown MIME');
    await expect.poll(() => editor.get.modelText()).toBe('Markdown MIME');

    await page
      .getByRole('button', { name: 'Reset block codec target' })
      .click();
    await editor.clipboard.pasteNativeText('**Markdown fallback**');

    await expect(editor.root.locator('strong')).toHaveText('Markdown fallback');
    await expect.poll(() => editor.get.modelText()).toBe('Markdown fallback');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('projects rich Plate descriptors to standalone HTML while the fragment envelope preserves exact state', async ({
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
      'plate-schema-rich-descriptor',
      page.locator('#plate-schema-descriptor-editor')
    );
    const readDocument = async () =>
      JSON.parse(
        (await page.getByTestId('plate-schema-document').textContent()) ??
          'null',
        (key, value) => (key === 'id' ? undefined : value)
      ) as Record<string, unknown>[];
    const collectNodes = (value: unknown): Record<string, unknown>[] => {
      if (!Array.isArray(value)) return [];

      return value.flatMap((node) => {
        if (!node || typeof node !== 'object') return [];

        const record = node as Record<string, unknown>;

        return [record, ...collectNodes(record.children)];
      });
    };
    const readProjection = async () => {
      const nodes = collectNodes(await readDocument());
      const byType = (type: string) => nodes.find((node) => node.type === type);
      const richText = nodes.find(
        (node) => node.text === 'Rich descriptor text'
      );
      const listItem = nodes.find((node) => node.listType === 'bulleted');
      const table = byType('table');
      const row = byType('tableRow');
      const codeBlock = byType('codeBlock');
      const codeLines = nodes.filter((node) => node.type === 'codeLine');
      const link = byType('link');
      const image = byType('image');
      const media = byType('mediaEmbed');

      return {
        code: {
          language: codeBlock?.language,
          lines: codeLines.map((line) =>
            collectNodes(line.children)
              .map((node) => node.text)
              .join('')
          ),
        },
        image: {
          alt: image?.alt,
          naturalHeight: image?.naturalHeight,
          naturalWidth: image?.naturalWidth,
          url: image?.url,
          width: image?.width,
        },
        link: {
          target: link?.target,
          url: link?.url,
        },
        list: {
          indent: listItem?.indent,
          listStyle: listItem?.listStyle ?? null,
          listType: listItem?.listType,
        },
        mark: {
          bold: richText?.bold,
          schemaAdvanced: richText?.schemaAdvanced,
        },
        media: {
          provider: media?.provider ?? null,
          sourceUrl: media?.sourceUrl ?? null,
          url: media?.url,
          width: media?.width,
        },
        table: {
          columnWidths: table?.columnWidths,
          marginLeft: table?.marginLeft,
          rowHeight: row?.height,
        },
      };
    };

    await page
      .getByRole('button', { name: 'Load rich descriptor document' })
      .click();
    await expect
      .poll(() => editor.get.modelText())
      .toContain('Rich descriptor text');

    const expectedDocument = await readDocument();

    await editor.selection.selectDOM({
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await page.keyboard.press('ControlOrMeta+A');

    const payload = await editor.clipboard.copyNativeEventPayload();

    expect(payload.types).toEqual(
      expect.arrayContaining([
        'application/x-plite-fragment',
        'text/html',
        'text/plain',
      ])
    );
    expect(payload.pliteFragment).toBeTruthy();
    expect(payload.html).toContain('data-plite-fragment=');
    expect(payload.html).toContain('<strong');
    expect(payload.html).toContain('data-schema-advanced="rich-proof"');
    expect(payload.html).toContain(
      '<a href="https://example.com/docs" target="_self"'
    );
    expect(payload.html).toContain('<ul');
    expect(payload.html).toContain('<li');
    expect(payload.html).toContain('data-list-type="bulleted"');
    expect(payload.html).toContain('<table');
    expect(payload.html).toContain('<colgroup');
    expect(payload.html).toContain('<tr');
    expect(payload.html).toContain('<td');
    expect(payload.html).toContain('<pre data-language="typescript"');
    expect(payload.html).toContain('<span data-code-line');
    expect(payload.html).toContain('<figure class="plate-image"');
    expect(payload.html).toContain('alt="Plate codec image"');
    expect(payload.html).toContain('<figure class="plate-media-embed"');
    expect(payload.html).toContain(
      'src="https://www.youtube.com/embed/M7lc1UVf-VE"'
    );
    expect(payload.html).toContain('Image caption');
    expect(payload.html).toContain('Media caption');

    const standaloneHtml = payload.html.replace(
      /\sdata-plite-fragment(?:-format)?=(?:"[^"]*"|'[^']*')/g,
      ''
    );

    expect(standaloneHtml).not.toContain('data-plite-fragment');
    expect(standaloneHtml).not.toContain(
      'https://www.youtube.com/watch?v=M7lc1UVf-VE'
    );

    await page
      .getByRole('button', { name: 'Reset block codec target' })
      .click();
    await editor.clipboard.pasteHtml(standaloneHtml, payload.text);

    await expect.poll(readProjection).toEqual({
      code: {
        language: 'typescript',
        lines: ['const codec = true;', ''],
      },
      image: {
        alt: 'Plate codec image',
        naturalHeight: 180,
        naturalWidth: 320,
        url: 'https://example.com/plate-codec.png',
        width: '50%',
      },
      link: {
        target: '_self',
        url: 'https://example.com/docs',
      },
      list: {
        indent: 1,
        listStyle: null,
        listType: 'bulleted',
      },
      mark: {
        bold: true,
        schemaAdvanced: 'rich-proof',
      },
      media: {
        provider: null,
        sourceUrl: null,
        url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
        width: '480px',
      },
      table: {
        columnWidths: [180],
        marginLeft: 12,
        rowHeight: 44,
      },
    });

    await page
      .getByRole('button', { name: 'Reset block codec target' })
      .click();
    await editor.clipboard.pasteEventPayload(payload);

    await expect.poll(readDocument).toEqual(expectedDocument);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('preserves exact product codec slices across priority, fallback, errors, configuration, and roots', async ({
  page,
}) => {
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openExample(page, 'plite/plate-schema-descriptors', {
      ready: { editor: 'visible' },
    });

    const editor = createPliteBrowserEditorHarness(
      page,
      'plate-codec-proof',
      page.locator('#plate-schema-descriptor-editor')
    );
    const readDocumentWithoutGeneratedIds = async () => {
      const document = JSON.parse(
        (await page.getByTestId('plate-schema-document').textContent()) ??
          'null'
      );

      return document.map((node: Record<string, unknown>) =>
        Object.fromEntries(
          Object.entries(node).filter(([property]) => property !== 'id')
        )
      );
    };

    await page
      .getByRole('button', { name: 'Reset inline codec target' })
      .click();
    await page
      .getByRole('button', { name: 'Import inline codec slice' })
      .click();
    await expect
      .poll(() => editor.get.modelText())
      .toBe('left initial:inline right');
    await expect(editor.root.locator('strong')).toHaveText('initial:inline');

    await page
      .getByRole('button', { name: 'Reset block codec target' })
      .click();
    await page
      .getByRole('button', { name: 'Import block codec slice' })
      .click();
    await expect.poll(readDocumentWithoutGeneratedIds).toEqual([
      { children: [{ text: 'initial:block-a' }], type: 'paragraph' },
      { children: [{ text: 'initial:block-b' }], type: 'paragraph' },
    ]);

    await page.getByRole('button', { name: 'Reset code codec target' }).click();
    await page.getByRole('button', { name: 'Import code codec slice' }).click();
    await expect
      .poll(() => editor.get.modelText())
      .toBe('left initial:code right');
    await expect(editor.root.locator('pre')).toContainText(
      'left initial:code right'
    );

    await page
      .getByRole('button', { name: 'Reset block codec target' })
      .click();
    await page
      .getByRole('button', { name: 'Import delegated codec slice' })
      .click();
    await expect.poll(() => editor.get.modelText()).toBe('fallback:delegate');

    await page
      .getByRole('button', { name: 'Reset block codec target' })
      .click();
    await page
      .getByRole('button', { name: 'Import throwing codec slice' })
      .click();
    await expect.poll(() => editor.get.modelText()).toBe('fallback:throw');

    await page
      .getByRole('button', { name: 'Use replacement codec state' })
      .click();
    await expect(page.getByTestId('plate-codec-label')).toHaveText(
      'replacement'
    );
    await page
      .getByRole('button', { name: 'Reset block codec target' })
      .click();
    await page
      .getByRole('button', { name: 'Import block codec slice' })
      .click();
    await expect.poll(readDocumentWithoutGeneratedIds).toEqual([
      { children: [{ text: 'replacement:block-a' }], type: 'paragraph' },
      { children: [{ text: 'replacement:block-b' }], type: 'paragraph' },
    ]);

    await page
      .getByRole('button', { name: 'Encode rooted Plate slice' })
      .click();
    await expect
      .poll(async () =>
        JSON.parse(
          (await page.getByTestId('plate-codec-encoded-slice').textContent()) ??
            'null'
        )
      )
      .toEqual({
        label: 'replacement',
        slice: {
          content: [{ children: [{ text: 'main' }], type: 'paragraph' }],
          openEnd: 0,
          openStart: 0,
          roots: {
            notes: [{ children: [{ text: 'named' }], type: 'paragraph' }],
            'projected:body': [
              { children: [{ text: 'projected' }], type: 'paragraph' },
            ],
          },
        },
      });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
