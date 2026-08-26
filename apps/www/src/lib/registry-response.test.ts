import { describe, expect, it } from 'bun:test';
import { readdir } from 'node:fs/promises';

import {
  PLATE_REGISTRY_BASES,
  PLATE_REGISTRY_STYLE_NAMES,
} from './plate-registry-styles';
import { createRegistryResponse } from './registry-response';

const CLASSIC_ITEM_NAMES = [
  'autoformat-classic',
  'fixed-toolbar-classic',
  'fixed-toolbar-classic-buttons',
  'floating-toolbar-classic',
  'floating-toolbar-classic-buttons',
  'insert-toolbar-classic-button',
  'list-classic',
  'list-classic-toolbar-button',
  'transforms-classic',
  'turn-into-toolbar-classic-button',
] as const;

const SUPPORTED_STYLES = PLATE_REGISTRY_BASES.flatMap((base) =>
  PLATE_REGISTRY_STYLE_NAMES.map((style) => `${base}-${style}`)
);

function getSourceContent(
  payload: Awaited<ReturnType<typeof createRegistryResponse>>
) {
  const file = Array.isArray(payload?.files) ? payload.files[0] : null;

  return file && typeof file === 'object' && 'content' in file
    ? file.content
    : null;
}

describe('registry style responses', () => {
  it('serves canonical Base payloads', async () => {
    const toolbar = await createRegistryResponse({
      directory: 'r',
      fileName: 'toolbar.json',
      origin: 'https://platejs.org',
      style: 'base-luma',
    });
    const editor = await createRegistryResponse({
      directory: 'r',
      fileName: 'editor-basic.json',
      origin: 'https://platejs.org',
      style: 'base-luma',
    });

    expect(toolbar?.dependencies).toEqual(['@base-ui/react']);
    expect(toolbar?.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'src/registry/bases/base/toolbar.tsx',
        }),
      ])
    );
    expect(editor?.registryDependencies).toEqual(
      expect.arrayContaining([
        'https://platejs.org/r/base-luma/plate-ui.json',
        'https://platejs.org/r/base-luma/editor.json',
      ])
    );
  });

  it('serves the Radix overlay through legacy and preset styles', async () => {
    for (const style of ['new-york', 'new-york-v4', 'radix-luma']) {
      const toolbar = await createRegistryResponse({
        directory: 'r',
        fileName: 'toolbar.json',
        origin: 'https://platejs.org',
        style,
      });

      expect(toolbar?.dependencies).toEqual([
        '@radix-ui/react-toolbar',
        '@radix-ui/react-tooltip',
      ]);
      expect(toolbar?.files).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'src/registry/bases/radix/toolbar.tsx',
          }),
        ])
      );
    }
  });

  it('materializes visibly different toolbar styles for both providers', async () => {
    for (const base of PLATE_REGISTRY_BASES) {
      const nova = getSourceContent(
        await createRegistryResponse({
          directory: 'r',
          fileName: 'toolbar.json',
          origin: 'https://platejs.org',
          style: `${base}-nova`,
        })
      );
      const lyra = getSourceContent(
        await createRegistryResponse({
          directory: 'r',
          fileName: 'toolbar.json',
          origin: 'https://platejs.org',
          style: `${base}-lyra`,
        })
      );

      expect(nova).toContain('rounded-lg');
      expect(lyra).toContain('rounded-none');
      expect(nova).not.toBe(lyra);
    }
  });

  it('keeps common styled source equal across providers', async () => {
    const base = await createRegistryResponse({
      directory: 'r',
      fileName: 'inline-combobox.json',
      origin: 'https://platejs.org',
      style: 'base-luma',
    });
    const radix = await createRegistryResponse({
      directory: 'r',
      fileName: 'inline-combobox.json',
      origin: 'https://platejs.org',
      style: 'radix-luma',
    });

    expect(base?.files).toEqual(radix?.files);
  });

  it('fails closed for unsupported styles', async () => {
    expect(
      await createRegistryResponse({
        directory: 'r',
        fileName: 'toolbar.json',
        origin: 'https://platejs.org',
        style: 'aria-luma',
      })
    ).toBeNull();
  });

  it('materializes a complete Base index', async () => {
    const registry = await createRegistryResponse({
      directory: 'r',
      fileName: 'registry.json',
      origin: 'https://platejs.org',
      style: 'base-luma',
    });
    const items = registry?.items ?? [];
    const toolbar = items.find((item) => item.name === 'toolbar');

    expect(toolbar?.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'src/registry/bases/base/toolbar.tsx',
        }),
      ])
    );
    for (const name of CLASSIC_ITEM_NAMES) {
      expect(
        items.some((item) => item.name === name),
        name
      ).toBe(true);
    }
  });

  it('serves every classic item under Base', async () => {
    for (const name of CLASSIC_ITEM_NAMES) {
      expect(
        await createRegistryResponse({
          directory: 'r',
          fileName: `${name}.json`,
          origin: 'https://platejs.org',
          style: 'base-nova',
        })
      ).not.toBeNull();
    }
  });

  it('serves every public registry payload under all 16 combinations', async () => {
    const directoryEntries = await readdir('public/r');
    const fileNames = directoryEntries.filter((fileName) =>
      fileName.endsWith('.json')
    );

    expect(fileNames.length).toBeGreaterThan(0);

    expect(fileNames).toHaveLength(381);

    for (const style of SUPPORTED_STYLES) {
      for (const fileName of fileNames) {
        expect(
          await createRegistryResponse({
            directory: 'r',
            fileName,
            origin: 'https://platejs.org',
            style,
          }),
          `${style}/${fileName}`
        ).not.toBeNull();
      }
    }
  });
});
