import { describe, expect, it } from 'bun:test';

import { createPlateRegistry } from './registry';

describe('Plate registry editor files', () => {
  const items = createPlateRegistry().items;

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

  it('keeps editor-base-kit relative plugin imports installable', () => {
    const itemsByName = new Map(items.map((item) => [item.name, item]));
    const editorBaseKit = itemsByName.get('editor-base-kit');

    expect(editorBaseKit).toBeDefined();
    expect(editorBaseKit?.files?.[0]?.target).toBe(
      '@components/editor/editor-base-kit.tsx'
    );

    const pluginDependencies = editorBaseKit?.registryDependencies
      ?.filter((dependency) => dependency.startsWith('@plate/'))
      .map((dependency) => dependency.slice('@plate/'.length))
      .filter((name) => name.endsWith('-kit'));

    expect(pluginDependencies?.length).toBeGreaterThan(0);

    for (const dependencyName of pluginDependencies ?? []) {
      const dependency = itemsByName.get(dependencyName);
      const file = dependency?.files?.[0];

      expect(file, dependencyName).toBeDefined();
      expect(file?.target, dependencyName).toBe(
        toEditorTarget(file?.path ?? '')
      );
      expect(file?.target?.startsWith('@components/editor/plugins/')).toBe(
        true
      );
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
        expect.objectContaining({
          path: 'blocks/editor-ai/components/editor/editor-kit.tsx',
          target: '@components/editor/editor-kit.tsx',
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
});
