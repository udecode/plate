import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getRegistryIndexComponentPath } from '../../scripts/registry-index.mts';
import { deriveRegistryPackageDependencies } from '../../scripts/registry-package-dependencies.mts';
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
        expect(
          existsSync(
            join(import.meta.dir, file?.path ?? `missing-${variant.itemName}`)
          )
        ).toBe(true);
      }
    }
  });

  it('derives selected provider packages from their source imports', () => {
    const expectedPackages = {
      base: {
        'editor-context-menu': ['@base-ui/react'],
        'editor-dropdown-menu': ['@base-ui/react'],
        'floating-popover': ['@base-ui/react'],
        toolbar: ['@base-ui/react'],
      },
      radix: {
        'editor-context-menu': [],
        'editor-dropdown-menu': [],
        'floating-popover': ['@radix-ui/react-popover'],
        toolbar: ['@radix-ui/react-toolbar', '@radix-ui/react-tooltip'],
      },
    } as const;
    const providerPackages = new Set([
      '@base-ui/react',
      '@radix-ui/react-popover',
      '@radix-ui/react-toolbar',
      '@radix-ui/react-tooltip',
    ]);
    const variantItemNames = new Set(
      [...EDITOR_REGISTRY_VARIANTS.values()].map((variant) => variant.itemName)
    );

    for (const base of PLATE_REGISTRY_BASES) {
      const selectedRegistry = createPlateRegistry('https://platejs.org', {
        base,
      });
      const derivedRegistry = deriveRegistryPackageDependencies(
        {
          ...selectedRegistry,
          items: selectedRegistry.items.filter((item) =>
            variantItemNames.has(item.name)
          ),
        },
        { sourceRoot: import.meta.dir }
      );

      for (const [itemName, expectedDependencies] of Object.entries(
        expectedPackages[base]
      )) {
        const dependencies = derivedRegistry.items.find(
          (item) => item.name === itemName
        )?.dependencies;

        expect(
          dependencies?.filter((dependency) =>
            providerPackages.has(dependency)
          ) ?? [],
          `${base}:${itemName}`
        ).toEqual(expectedDependencies);
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
          .filter(
            (entry) =>
              !entry.isFile() ||
              !/\.(?:spec|test)\.[cm]?[jt]sx?$/.test(entry.name)
          )
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

  it('routes copied editor menus through declared provider adapters', () => {
    const menuAdapters = {
      'context-menu': '@plate/editor-context-menu',
      'dropdown-menu': '@plate/editor-dropdown-menu',
    } as const;

    for (const item of items) {
      for (const file of item.files ?? []) {
        if (!file.path.startsWith('components/editor/')) continue;

        const source = readFileSync(join(import.meta.dir, file.path), 'utf-8');
        const menuImports = source.matchAll(
          /from ['"](@\/(?:registry\/components\/editor|components\/ui)\/(context-menu|dropdown-menu))['"]/g
        );

        for (const [, moduleName, menuName] of menuImports) {
          expect(moduleName, `${item.name}:${file.path}`).toBe(
            `@/registry/components/editor/${menuName}`
          );
          expect(
            item.registryDependencies,
            `${item.name}:${file.path}`
          ).toContain(menuAdapters[menuName as keyof typeof menuAdapters]);
          expect(source, `${item.name}:${file.path}`).not.toMatch(
            new RegExp(
              `<${menuName === 'context-menu' ? 'ContextMenu' : 'DropdownMenu'}Trigger\\s+asChild`
            )
          );
        }
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

  it('shares neutral formatting kits across live and static editors', () => {
    const itemsByName = new Map(items.map((item) => [item.name, item]));
    const staticDependencies = itemsByName.get(
      'editor-plugins-static'
    )?.registryDependencies;

    expect(itemsByName.has('align-static')).toBe(false);
    expect(itemsByName.has('line-height-static')).toBe(false);
    expect(staticDependencies).toContain('@plate/align');
    expect(staticDependencies).toContain('@plate/line-height');
    expect(itemsByName.get('align')?.registryDependencies).toBeUndefined();
    expect(
      itemsByName.get('line-height')?.registryDependencies
    ).toBeUndefined();
  });

  it('keeps editor block component imports installable', () => {
    const itemsByName = new Map(items.map((item) => [item.name, item]));
    const editorAi = itemsByName.get('editor-ai');
    const editorBasic = itemsByName.get('editor-basic');

    expect(editorAi?.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'blocks/editor-ai/components/editor/rich-text-editor.tsx',
          target: '@components/editor/rich-text-editor.tsx',
        }),
      ])
    );
    expect(editorBasic?.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'blocks/editor-basic/components/editor/rich-text-editor.tsx',
          target: '@components/editor/rich-text-editor.tsx',
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
      'blocks/editor-ai/components/editor/rich-text-editor.tsx',
      'blocks/editor-ai/components/editor/rich-text-editor-value.ts',
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

    expect(editorPlugins?.dependencies).toContain('platejs');
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
        '@plate/docx-source',
        '@plate/editor',
        '@plate/editor-plugins',
        '@plate/export-toolbar-button',
        '@plate/import-toolbar-button',
        '@plate/toolbar',
      ])
    );
  });

  it('keeps DOCX presentation in copied registry source', () => {
    const exportKit = readFileSync(
      join(import.meta.dir, 'components/editor/docx-export.tsx'),
      'utf-8'
    );
    const exportToolbar = readFileSync(
      join(import.meta.dir, 'components/editor/export-toolbar-button.tsx'),
      'utf-8'
    );

    expect(exportKit).toContain('export const DOCX_EXPORT_STYLES');
    expect(exportKit).toContain("font-family: 'Calibri'");
    expect(exportKit).toContain(
      '.hljs-doctag, .hljs-keyword, .hljs-template-tag'
    );
    expect(exportToolbar).toContain('stylesheet: DOCX_EXPORT_STYLES');
  });
});
