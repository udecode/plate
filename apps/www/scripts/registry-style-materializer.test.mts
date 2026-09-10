import { describe, expect, it } from 'bun:test';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import type { Registry } from 'shadcn/schema';

import {
  createSparseRegistryIndexOverlay,
  materializeRegistryStyles,
  mergeRegistryProviderOverlay,
  transformRegistryPayload,
} from './registry-style-materializer.mts';
import {
  getCommonRegistryStyleMarkers,
  loadRegistryStyleMaps,
} from './registry-style-transform.mts';

describe('registry style materializer', () => {
  it('publishes transformed docs content through the shadcn build', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'plate-docs-'));
    const appDirectory = path.join(directory, 'apps/www');
    const sourceDirectory = path.resolve(import.meta.dir, '..');
    const files = [
      '../../content/docs/meta.json',
      '../../content/docs/(guides)/editor.mdx',
      'src/registry/blocks/fumadocs/content/docs/index.mdx',
      'src/registry/blocks/fumadocs/fumadocs-mdx-components.tsx',
      'src/registry/blocks/fumadocs/mdx-plate-components.tsx',
    ];

    try {
      for (const file of files) {
        const target = path.resolve(appDirectory, file);
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.copyFile(path.resolve(sourceDirectory, file), target);
      }

      const registryFile = path.join(appDirectory, 'registry.json');
      const generator = pathToFileURL(
        path.join(import.meta.dir, 'build-docs-registry.mts')
      ).href;

      await promisify(execFile)(
        'bun',
        [
          '-e',
          `import { writeFile } from 'node:fs/promises';
import { createDocsRegistry, createPublicDocsRegistry } from ${JSON.stringify(generator)};
await writeFile('registry.json', JSON.stringify(createPublicDocsRegistry(await createDocsRegistry())));`,
        ],
        { cwd: appDirectory }
      );

      const registry: Registry = JSON.parse(
        await fs.readFile(registryFile, 'utf-8')
      );
      const baseRawDir = path.join(directory, 'raw');

      await promisify(execFile)(
        'node',
        [
          createRequire(import.meta.url).resolve('shadcn'),
          'build',
          registryFile,
          '--output',
          baseRawDir,
        ],
        { cwd: appDirectory }
      );

      const canonicalDir = path.join(directory, 'public/r');
      const providerRawDir = path.join(directory, 'provider');
      await fs.mkdir(providerRawDir);
      const { combinations } = await materializeRegistryStyles({
        baseRawDir,
        canonicalDir,
        overlayDir: path.join(directory, 'overlays'),
        providerRawDir,
        styleMaps: await loadRegistryStyleMaps(),
      });
      const publishedRegistry: Registry = JSON.parse(
        await fs.readFile(path.join(canonicalDir, 'registry.json'), 'utf-8')
      );

      for (const name of ['docs-meta', 'editor-docs']) {
        const expected = registry.items.find((item) => item.name === name);
        const aggregate = publishedRegistry.items.find(
          (item) => item.name === name
        );
        const individual = JSON.parse(
          await fs.readFile(path.join(canonicalDir, `${name}.json`), 'utf-8')
        );

        expect(expected?.files?.[0]?.content).toContain('/docs/plate/');
        expect(individual.files).toEqual(expected?.files);
        expect(individual.files).toEqual(aggregate?.files);
        expect(
          combinations.every(
            ({ files: overlayFiles }) => !overlayFiles.includes(`${name}.json`)
          )
        ).toBe(true);
      }

      const fumadocs = JSON.parse(
        await fs.readFile(path.join(canonicalDir, 'fumadocs.json'), 'utf-8')
      );
      const landingPage = files[2];
      expect(fumadocs.files[0].content).toBe(
        await fs.readFile(path.join(appDirectory, landingPage), 'utf-8')
      );
      for (const file of files) {
        expect(
          await fs.readFile(path.resolve(appDirectory, file), 'utf-8')
        ).toBe(await fs.readFile(path.resolve(sourceDirectory, file), 'utf-8'));
      }
    } finally {
      await fs.rm(directory, { force: true, recursive: true });
    }
  });

  it('transforms source files without touching non-source payloads', async () => {
    const styleMaps = await loadRegistryStyleMaps();
    const commonMarkers = getCommonRegistryStyleMarkers(styleMaps);
    const payload = await transformRegistryPayload({
      commonMarkers,
      payload: {
        files: [
          {
            content: `const toggle = cva('cn-toggle');`,
            path: 'components/editor/toggle.tsx',
          },
          {
            content: 'cn-toggle',
            path: 'docs/toggle.md',
          },
        ],
        name: 'toggle',
      },
      styleMap: styleMaps.lyra,
    });

    expect(payload.files?.[0]?.content).toContain('rounded-none');
    expect(payload.files?.[0]?.content).not.toContain('cn-toggle');
    expect(payload.files?.[1]?.content).toBe('cn-toggle');
  });

  it('merges provider metadata and emits only changed index items', () => {
    const canonical = {
      items: [
        { dependencies: ['@base-ui/react'], name: 'toolbar' },
        { name: 'editor' },
      ],
      name: 'plate',
    };
    const provider = {
      items: [
        {
          dependencies: ['@radix-ui/react-toolbar'],
          name: 'toolbar',
        },
      ],
      name: 'plate',
    };
    const merged = mergeRegistryProviderOverlay(canonical, provider);
    const overlay = createSparseRegistryIndexOverlay(canonical, merged);

    expect(merged.items).toEqual([
      {
        dependencies: ['@radix-ui/react-toolbar'],
        name: 'toolbar',
      },
      { name: 'editor' },
    ]);
    expect(overlay?.items).toEqual([
      {
        dependencies: ['@radix-ui/react-toolbar'],
        name: 'toolbar',
      },
    ]);
  });
});
