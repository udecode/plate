import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getRegistryIndexComponentPath } from '../../scripts/registry-index.mts';
import {
  createPlateRegistry,
  PLATE_DEFAULT_REGISTRY_BASE,
  PLATE_REGISTRY_BASES,
} from './registry';
import {
  EDITOR_REGISTRY_VARIANTS,
  getEditorRegistryVariantFileName,
  getEditorRegistryVariantSourcePath,
} from './registry-variants';

describe('Plate registry editor files', () => {
  const { items } = createPlateRegistry();

  it('uses the supported shadcn preset bases', () => {
    expect(PLATE_REGISTRY_BASES).toEqual(['base', 'radix']);
    expect(PLATE_DEFAULT_REGISTRY_BASE).toBe('base');
    expect(
      createPlateRegistry().items.find((item) => item.name === 'toolbar')
        ?.files?.[0]?.path
    ).toBe('bases/base/toolbar.tsx');
  });

  function toEditorTarget(path: string) {
    return `@components/editor/${path.slice(
      path.indexOf('components/editor/') + 'components/editor/'.length
    )}`;
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

  it('resolves direct primitive owners through base variants', () => {
    for (const [target, variant] of EDITOR_REGISTRY_VARIANTS) {
      const fileName = getEditorRegistryVariantFileName(target);

      expect(
        existsSync(join(import.meta.dir, 'components/editor', fileName))
      ).toBe(false);

      for (const base of PLATE_REGISTRY_BASES) {
        const item = createPlateRegistry('https://platejs.org', {
          base,
        }).items.find((candidate) => candidate.name === variant.itemName);
        const file = item?.files?.[0];

        expect(file?.path).toBe(
          getEditorRegistryVariantSourcePath(target, base)
        );
        expect(file?.target).toBe(target);
        for (const packageName of variant.packages[base]) {
          expect(item?.dependencies).toContain(packageName);
        }
        expect(
          existsSync(
            join(import.meta.dir, file?.path ?? `missing-${variant.itemName}`)
          )
        ).toBe(true);
      }
    }
  });

  it('keeps only declared provider authors in each base directory', () => {
    const expectedFileNames = [...EDITOR_REGISTRY_VARIANTS.keys()]
      .map(getEditorRegistryVariantFileName)
      .sort();

    for (const base of PLATE_REGISTRY_BASES) {
      const entries = readdirSync(join(import.meta.dir, 'bases', base), {
        withFileTypes: true,
      });

      expect(
        entries
          .map((entry) => (entry.isFile() ? entry.name : `${entry.name}/`))
          .sort()
      ).toEqual(expectedFileNames);
    }
  });

  it('keeps website provider routing outside copied registry source', () => {
    const tsconfig = JSON.parse(
      readFileSync(join(import.meta.dir, '../../tsconfig.json'), 'utf-8')
    ) as {
      compilerOptions: { paths: Record<string, string[]> };
    };

    for (const target of EDITOR_REGISTRY_VARIANTS.keys()) {
      const moduleName = target
        .replace('@components/', '@/registry/components/')
        .replace(/\.tsx$/, '');
      const fileName = getEditorRegistryVariantFileName(target).replace(
        /\.tsx$/,
        ''
      );
      const sourcePath = `./src/components/site-registry/${fileName}`;

      expect(tsconfig.compilerOptions.paths[moduleName]).toEqual([sourcePath]);

      for (const item of items) {
        expect(item.files?.map((file) => file.path)).not.toContain(
          `../components/site-registry/${fileName}.tsx`
        );
      }
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
