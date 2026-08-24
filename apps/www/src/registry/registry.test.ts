import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getRegistryIndexComponentPath } from '../../scripts/registry-index.mts';
import { createPlateRegistry, PLATE_REGISTRY_BASES } from './registry';

describe('Plate registry editor files', () => {
  const { items } = createPlateRegistry();

  function toEditorTarget(path: string) {
    return `@components/editor/${path.slice(path.indexOf('components/editor/') + 'components/editor/'.length)}`;
  }

  it('installs editor component files through the configured components alias', () => {
    for (const item of items) {
      for (const file of item.files ?? []) {
        if (!file.path.includes('components/editor/')) continue;

        expect(file.target, `${item.name}:${file.path}`).toBe(
          toEditorTarget(file.path)
        );
      }
    }
  });

  it('resolves every Toolbar base to one installed editor path', () => {
    for (const base of PLATE_REGISTRY_BASES) {
      const toolbar = createPlateRegistry('https://platejs.org', {
        base,
      }).items.find((item) => item.name === 'toolbar');
      const file = toolbar?.files?.[0];

      expect(file?.path).toBe(
        base === 'radix'
          ? 'components/editor/toolbar.tsx'
          : `bases/${base}/editor/toolbar.tsx`
      );
      expect(file?.target).toBe('@components/editor/toolbar.tsx');
      expect(toolbar?.dependencies).toContain(
        base === 'base'
          ? '@base-ui/react'
          : base === 'aria'
            ? 'react-aria-components'
            : '@radix-ui/react-toolbar'
      );
      expect(
        existsSync(join(import.meta.dir, file?.path ?? 'missing-toolbar'))
      ).toBe(true);
    }
  });

  it('keeps static editor feature imports flat and installable', () => {
    const itemsByName = new Map(items.map((item) => [item.name, item]));
    const staticEditor = itemsByName.get('editor-plugins-static');

    expect(staticEditor).toBeDefined();
    expect(staticEditor?.files?.[0]?.target).toBe(
      '@components/editor/plugins-static.ts'
    );

    const featureDependencies = staticEditor?.registryDependencies
      ?.filter((dependency) => dependency.startsWith('@plate/'))
      .map((dependency) => dependency.slice('@plate/'.length));

    expect(featureDependencies?.length).toBeGreaterThan(0);

    for (const dependencyName of featureDependencies ?? []) {
      const dependency = itemsByName.get(dependencyName);
      const file = dependency?.files?.[0];

      expect(file, dependencyName).toBeDefined();
      expect(file?.target, dependencyName).toBe(
        toEditorTarget(file?.path ?? '')
      );
      expect(file?.target?.startsWith('@components/editor/')).toBe(true);
      expect(file?.target).not.toContain('/plugins/');
    }
  });

  it('keeps editor block component imports installable', () => {
    const itemsByName = new Map(items.map((item) => [item.name, item]));
    const editorAi = itemsByName.get('editor-ai');
    const editorBasic = itemsByName.get('editor-basic');

    expect(editorAi?.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'blocks/editor-ai/components/editor/plate-editor.tsx',
          target: '@components/editor/plate-editor.tsx',
        }),
      ])
    );
    expect(editorBasic?.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'blocks/editor-basic/components/editor/plate-editor.tsx',
          target: '@components/editor/plate-editor.tsx',
        }),
      ])
    );
  });

  it('keeps generated preview entrypoints client-compatible', () => {
    for (const item of items) {
      const componentPath = getRegistryIndexComponentPath(item);

      if (!componentPath) continue;

      const previewPath = componentPath.slice('@/registry/'.length);

      const source = readFileSync(join(import.meta.dir, previewPath), 'utf-8');

      expect(source, item.name).not.toMatch(
        /export\s+(?:const\s+metadata|function\s+generateMetadata)\b/
      );
    }
  });

  it('keeps generated editor contracts application-owned', () => {
    expect(
      items
        .find((item) => item.name === 'editor-plugins')
        ?.files?.map((file) => file.path)
    ).toContain('components/editor/plugins.ts');

    const generatedEditorContracts = items.flatMap((item) =>
      (item.files ?? [])
        .filter((file) =>
          /plugins\.(?:generated\.ts|schema\.json)$/.test(file.path)
        )
        .map((file) => ({
          item: item.name,
          path: file.path,
          target: file.target,
        }))
    );

    expect(generatedEditorContracts).toEqual([]);
  });

  it('reuses the primary editor from derived registry items', () => {
    const itemsByName = new Map(items.map((item) => [item.name, item]));

    expect(
      itemsByName.get('editor-ai')?.files?.map((file) => file.path)
    ).toEqual([
      'blocks/editor-ai/page.tsx',
      'blocks/editor-ai/components/editor/plate-editor.tsx',
    ]);
    expect(
      itemsByName.get('copilot-demo')?.files?.map((file) => file.path)
    ).toEqual([
      'examples/copilot-demo.tsx',
      'examples/values/copilot-value.tsx',
    ]);
    expect(
      itemsByName
        .get('markdown-streaming-demo')
        ?.files?.map((file) => file.path)
    ).toEqual(['examples/markdown-streaming-demo.tsx']);

    for (const name of ['editor-ai', 'markdown-streaming-demo']) {
      expect(itemsByName.get(name)?.registryDependencies).toEqual(
        expect.arrayContaining(['@plate/editor'])
      );
      expect(itemsByName.get(name)?.registryDependencies).not.toContain(
        '@plate/copilot'
      );
    }

    expect(itemsByName.get('copilot-demo')?.registryDependencies).toEqual(
      expect.arrayContaining(['@plate/editor', '@plate/copilot'])
    );
    expect(
      items
        .filter((item) => item.registryDependencies?.includes('@plate/copilot'))
        .map((item) => item.name)
    ).toEqual(['copilot-demo']);
  });

  it('keeps DOCX file IO isolated to the dedicated DOCX example', () => {
    const itemsByName = new Map(items.map((item) => [item.name, item]));
    const docxDemo = itemsByName.get('docx-demo');
    const editorPlugins = itemsByName.get('editor-plugins');
    const fixedToolbar = itemsByName.get('fixed-toolbar');

    expect(editorPlugins?.dependencies).toContain('@platejs/docx-paste');
    expect(editorPlugins?.registryDependencies).not.toContain('@plate/docx');
    expect(fixedToolbar?.registryDependencies).not.toEqual(
      expect.arrayContaining([
        '@plate/export-toolbar-button',
        '@plate/import-toolbar-button',
      ])
    );
    expect(docxDemo?.files?.map((file) => file.path)).toEqual([
      'examples/docx-demo.tsx',
      'examples/values/deserialize-docx-value.tsx',
    ]);
    expect(docxDemo?.registryDependencies).toEqual(
      expect.arrayContaining([
        '@plate/docx',
        '@plate/editor',
        '@plate/editor-plugins',
        '@plate/export-toolbar-button',
        '@plate/import-toolbar-button',
        '@plate/toolbar',
      ])
    );
  });
});
