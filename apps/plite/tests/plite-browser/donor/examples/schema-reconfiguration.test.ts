import { expect, test } from '@playwright/test';
import {
  createPliteBrowserEditorHarness,
  openExample,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

test('publishes schema-only behavior atomically across primary, named, and projected roots', async ({
  page,
}) => {
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openExample(page, 'plite/schema-reconfiguration', {
      ready: { editor: 'visible', text: 'probe' },
      surface: { scope: '#schema-reconfiguration-main' },
    });
    const primary = createPliteBrowserEditorHarness(
      page,
      'schema-reconfiguration-main',
      page.locator('#schema-reconfiguration-main')
    );
    const named = primary.rootAt('#schema-reconfiguration-notes');
    const roots = [
      page.locator('#schema-reconfiguration-main'),
      page.locator('#schema-reconfiguration-notes'),
      page.locator('#schema-reconfiguration-projected'),
    ];
    const probe = (root: (typeof roots)[number]) =>
      root.locator(':scope > [data-plite-node="element"][data-plite-path="0"]');
    const status = page.getByTestId('schema-reconfiguration-status');
    const document = page.getByTestId('schema-reconfiguration-document');
    const initialDocument = await document.textContent();
    const initialRuntimeIds = await Promise.all(
      roots.map((root) => probe(root).getAttribute('data-plite-runtime-id'))
    );
    const expectDocumentAndRuntimeIdsStable = async () => {
      await expect
        .poll(async () => JSON.parse((await document.textContent()) ?? 'null'))
        .toEqual(JSON.parse(initialDocument ?? 'null'));
      expect(
        await Promise.all(
          roots.map((root) => probe(root).getAttribute('data-plite-runtime-id'))
        )
      ).toEqual(initialRuntimeIds);
    };
    const expectSchemaOnlyPublication = async (expectedStatus: string) => {
      await expect(status).toHaveText(expectedStatus);
      await expectDocumentAndRuntimeIdsStable();

      const commit = (await primary.get.lastCommit()) as {
        changedRoots?: unknown[];
      } | null;

      expect(commit?.changedRoots).toEqual([]);
    };

    for (const root of roots) {
      await expect(probe(root)).toHaveCount(1);
      await expect(probe(root)).not.toHaveAttribute(
        'data-plite-inline',
        'true'
      );
      await expect(probe(root)).not.toHaveAttribute('data-plite-void', 'true');
    }

    await page.getByRole('button', { name: 'Use inline schema' }).click();

    for (const root of roots) {
      await expect(probe(root)).toHaveAttribute('data-plite-inline', 'true');
      await expect(probe(root)).not.toHaveAttribute('data-plite-void', 'true');
    }
    await expectSchemaOnlyPublication(
      'inline:true;void:false;editableIsland:false;readOnly:false;selectable:true;document:unchanged'
    );

    await page.getByRole('button', { name: 'Use void schema' }).click();

    for (const root of roots) {
      await expect(probe(root)).not.toHaveAttribute(
        'data-plite-inline',
        'true'
      );
      await expect(probe(root)).toHaveAttribute('data-plite-void', 'true');
    }
    await expect(page.getByTestId('schema-reconfiguration-void')).toHaveCount(
      3
    );
    await expectSchemaOnlyPublication(
      'inline:false;void:true;editableIsland:false;readOnly:false;selectable:true;document:unchanged'
    );

    await page
      .getByRole('button', { name: 'Use editable-island schema' })
      .click();
    await expectSchemaOnlyPublication(
      'inline:false;void:true;editableIsland:true;readOnly:false;selectable:true;document:unchanged'
    );

    for (const [index, root] of roots.entries()) {
      await expect(probe(root)).toHaveAttribute('data-plite-void', 'true');

      const island = probe(root).getByTestId('schema-reconfiguration-island');

      await expect(island).toBeEditable();
      await island.fill(`nested target ${index}`);
      await expect(island).toHaveValue(`nested target ${index}`);
    }
    await expectDocumentAndRuntimeIdsStable();

    await page.getByRole('button', { name: 'Use read-only schema' }).click();
    await expectSchemaOnlyPublication(
      'inline:false;void:false;editableIsland:false;readOnly:true;selectable:true;document:unchanged'
    );
    await named.selection.select({
      kind: 'text',
      anchor: { path: [1, 1, 0], offset: 2 },
      focus: { path: [1, 1, 0], offset: 2 },
    });
    await page.keyboard.type('X');
    await expect
      .poll(async () => JSON.parse((await document.textContent()) ?? 'null'))
      .toEqual(JSON.parse(initialDocument ?? 'null'));
    await expect(page.getByTestId('schema-reconfiguration-guard')).toHaveCount(
      3
    );
    await expect(
      page.getByTestId('schema-reconfiguration-guard').first()
    ).toHaveText('guard');

    await page
      .getByRole('button', { name: 'Use non-selectable schema' })
      .click();
    await expectSchemaOnlyPublication(
      'inline:false;void:false;editableIsland:false;readOnly:false;selectable:false;document:unchanged'
    );
    await named.selection.selectDOM({
      kind: 'text',
      anchor: { path: [1, 2], offset: 0 },
      focus: { path: [1, 2], offset: 0 },
    });
    await named.root.press('ArrowLeft');
    await named.assert.selection({
      kind: 'text',
      anchor: { path: [1, 0], offset: 'before'.length - 1 },
      focus: { path: [1, 0], offset: 'before'.length - 1 },
    });

    await page.getByRole('button', { name: 'Use block schema' }).click();
    await expectSchemaOnlyPublication(
      'inline:false;void:false;editableIsland:false;readOnly:false;selectable:true;document:unchanged'
    );
    await named.selection.select({
      kind: 'text',
      anchor: { path: [1, 1, 0], offset: 2 },
      focus: { path: [1, 1, 0], offset: 2 },
    });
    await page.keyboard.type('X');
    await expect
      .poll(async () => {
        const value = JSON.parse((await document.textContent()) ?? 'null');

        return value.roots.notes[1].children[1].children[0].text;
      })
      .toBe('guXard');

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('compiles Plate element and mark descriptors into HTML parsing, rendering, and Markdown clipboard bindings', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');

  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openExample(page, 'plite/schema-reconfiguration', {
      ready: { editor: 'visible', text: 'probe' },
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
