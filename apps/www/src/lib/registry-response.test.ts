import { describe, expect, it } from 'bun:test';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  PLATE_REGISTRY_BASES,
  PLATE_REGISTRY_STYLE_NAMES,
} from './plate-registry-styles';
import { createRegistryResponse } from './registry-response';

const SUPPORTED_STYLES = PLATE_REGISTRY_BASES.flatMap((base) =>
  PLATE_REGISTRY_STYLE_NAMES.map((style) => `${base}-${style}`)
);
const ROUTE_STYLES = [...SUPPORTED_STYLES, 'new-york', 'new-york-v4'];

async function createGeneratedFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'plate-registry-response-'));

  await mkdir(path.join(root, 'src/__registry__'), { recursive: true });

  await Promise.all([
    cp('public/r', path.join(root, 'public/r'), { recursive: true }),
    cp(
      'src/__registry__/overlays',
      path.join(root, 'src/__registry__/overlays'),
      {
        recursive: true,
      }
    ),
    cp(
      'src/__registry__/generation.json',
      path.join(root, 'src/__registry__/generation.json')
    ),
    cp(
      'src/__registry__/registry-metadata.json',
      path.join(root, 'src/__registry__/registry-metadata.json')
    ),
  ]);

  return root;
}

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

    expect(toolbar?.dependencies).toEqual(
      expect.arrayContaining(['@base-ui/react'])
    );
    expect(toolbar?.dependencies).not.toContain('@radix-ui/react-toolbar');
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

      expect(toolbar?.dependencies).toEqual(
        expect.arrayContaining([
          '@radix-ui/react-toolbar',
          '@radix-ui/react-tooltip',
        ])
      );
      expect(toolbar?.dependencies).not.toContain('@base-ui/react');
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
  });

  it('keeps the canonical index complete and serves all 36 routes', async () => {
    const directoryEntries = await readdir('public/r');
    const fileNames = directoryEntries.filter((fileName) =>
      fileName.endsWith('.json')
    );
    const registry = JSON.parse(
      await readFile('public/r/registry.json', 'utf-8')
    ) as { items: Array<{ name: string }> };

    expect(fileNames.length).toBeGreaterThan(0);
    expect(fileNames.toSorted()).toEqual(
      [
        'registry.json',
        'registry-docs.json',
        ...registry.items.map(({ name }) => `${name}.json`),
      ].toSorted()
    );

    for (const directory of ['r', 'rd'] as const) {
      for (const style of ROUTE_STYLES) {
        for (const fileName of [
          'registry.json',
          'registry-docs.json',
          'toolbar.json',
        ]) {
          expect(
            await createRegistryResponse({
              directory,
              fileName,
              origin:
                directory === 'r'
                  ? 'https://platejs.org'
                  : 'http://localhost:3000',
              style,
            }),
            `${directory}/${style}/${fileName}`
          ).not.toBeNull();
        }
      }
    }
  });

  it('rejects a mixed metadata generation', async () => {
    const root = await createGeneratedFixture();

    try {
      const metadataPath = path.join(
        root,
        'src/__registry__/registry-metadata.json'
      );
      const metadata = JSON.parse(await readFile(metadataPath, 'utf-8')) as {
        generation: string;
      };
      await writeFile(
        metadataPath,
        `${JSON.stringify({ ...metadata, generation: 'stale' }, null, 2)}\n`
      );

      await expect(
        createRegistryResponse({
          directory: 'r',
          fileName: 'toolbar.json',
          origin: 'https://platejs.org',
          root,
          style: 'base-nova',
        })
      ).rejects.toThrow('Registry generation metadata does not match.');
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('rejects an overlay listed by the manifest when its file is absent', async () => {
    const root = await createGeneratedFixture();

    try {
      const manifestPath = path.join(
        root,
        'src/__registry__/overlays/manifest.json'
      );
      const manifest = JSON.parse(await readFile(manifestPath, 'utf-8')) as {
        combinations: Array<{ files: string[]; style: string }>;
      };
      const combination = manifest.combinations.find(
        ({ files }) => files.length > 0
      );

      expect(combination).toBeDefined();
      const fileName = combination!.files[0];
      await rm(
        path.join(
          root,
          'src/__registry__/overlays',
          combination!.style,
          fileName
        )
      );

      await expect(
        createRegistryResponse({
          directory: 'r',
          fileName,
          origin: 'https://platejs.org',
          root,
          style: combination!.style,
        })
      ).rejects.toThrow('Registry manifest lists a missing payload');
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
