import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'bun:test';

import { registryUI } from '../registry-ui';

const composedToolbarNames = [
  'fixed-toolbar-buttons',
  'floating-toolbar-buttons',
  'turn-into-toolbar-button',
];

describe('composed toolbar registry', () => {
  it.each(
    composedToolbarNames
  )('ships every relative UI dependency of %s', (itemName) => {
    const item = registryUI.find((item) => item.name === itemName);

    expect(item).toBeDefined();

    const itemFiles = new Set(item!.files?.map((file) => file.path));
    const registryDependencies = new Set(item!.registryDependencies);

    for (const file of item!.files ?? []) {
      const source = readFileSync(
        new URL(`./${file.path.replace('ui/', '')}`, import.meta.url),
        'utf8'
      );
      const relativeImports = source.matchAll(/from ['"]\.\/([^'"]+)['"]/g);

      for (const [, importPath] of relativeImports) {
        const sourcePath = `ui/${importPath}.tsx`;

        if (itemFiles.has(sourcePath)) continue;

        const owner = registryUI.find((candidate) =>
          candidate.files?.some(
            (candidateFile) => candidateFile.path === sourcePath
          )
        );

        expect(owner, `${sourcePath} has no registry owner`).toBeDefined();
        expect(
          registryDependencies,
          `${item!.name} does not install ${owner!.name}`
        ).toContain(`@plate/${owner!.name}`);
      }
    }
  });

  it.each([
    'fixed-toolbar-buttons',
    'floating-toolbar-buttons',
  ])('keeps %s subscribed only to the read-only context', (itemName) => {
    const source = readFileSync(
      new URL(`./${itemName}.tsx`, import.meta.url),
      'utf8'
    );

    expect(source.match(/\buseEditorReadOnly\(\)/g)).toHaveLength(1);
    expect(source).not.toMatch(
      /\b(?:useEditor|useEditorSelector|useEditorState|usePlateEditor|useSelectionFragmentProp)\(/
    );
    expect(source).not.toMatch(
      /\b(?:editor\.children|read\.children|read\.nodes)\b/
    );
  });

  it('keeps turn-into subscribed to the selected block fact', () => {
    const source = readFileSync(
      new URL('./turn-into-toolbar-button.tsx', import.meta.url),
      'utf8'
    );

    expect(source.match(/\buseSelectionFragmentProp\(/g)).toHaveLength(1);
    expect(source).not.toMatch(/\b(?:useEditorSelector|useEditorState)\(/);
    expect(source).not.toMatch(
      /\b(?:editor\.children|read\.children|read\.nodes)\b/
    );
  });
});
