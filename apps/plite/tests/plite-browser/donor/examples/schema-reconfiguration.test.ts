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
    const initialNodeKeys = await Promise.all(
      roots.map((root) => probe(root).getAttribute('data-plite-node-key'))
    );
    const expectDocumentAndNodeKeysStable = async () => {
      await expect
        .poll(async () => JSON.parse((await document.textContent()) ?? 'null'))
        .toEqual(JSON.parse(initialDocument ?? 'null'));
      expect(
        await Promise.all(
          roots.map((root) => probe(root).getAttribute('data-plite-node-key'))
        )
      ).toEqual(initialNodeKeys);
    };
    const expectSchemaOnlyPublication = async (expectedStatus: string) => {
      await expect(status).toHaveText(expectedStatus);
      await expectDocumentAndNodeKeysStable();

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
    await expectDocumentAndNodeKeysStable();

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
