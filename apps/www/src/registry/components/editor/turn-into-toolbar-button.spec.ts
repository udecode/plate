import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

import { registryEditor } from '../../registry-editor';
import { registryFeatures } from '../../registry-features';

const registryItems = [...registryEditor, ...registryFeatures];

const composedToolbarNames = [
  'fixed-toolbar',
  'floating-toolbar',
  'turn-into-toolbar-button',
];

describe('composed toolbar registry', () => {
  it.each(composedToolbarNames)(
    'ships every relative UI dependency of %s',
    (itemName) => {
      const item = registryItems.find(
        (innerItem) => innerItem.name === itemName
      );

      expect(item).toBeDefined();

      const itemFiles = new Set(item!.files?.map((file) => file.path));
      const registryDependencies = new Set(item!.registryDependencies);

      for (const file of item!.files ?? []) {
        const source = readFileSync(
          new URL(`../../${file.path}`, import.meta.url),
          'utf-8'
        );
        const relativeImports = source.matchAll(/from ['"]\.\/([^'"]+)['"]/g);

        for (const [, importPath] of relativeImports) {
          const sourcePath = `components/editor/${importPath}.tsx`;

          if (itemFiles.has(sourcePath)) continue;

          const owner = registryItems.find((candidate) =>
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
    }
  );

  it.each([
    ['fixed-toolbar', 'FixedToolbarButtons', 'export function FixedToolbar('],
    [
      'floating-toolbar',
      'FloatingToolbarButtons',
      'type FloatingToolbarOptions',
    ],
  ] as const)(
    'keeps %s subscribed only to the read-only context',
    (itemName, componentName, endMarker) => {
      const source = readFileSync(
        new URL(`${itemName}.tsx`, import.meta.url),
        'utf-8'
      );
      const componentSource = source.slice(
        source.indexOf(`export function ${componentName}`),
        source.indexOf(endMarker)
      );

      expect(componentSource.match(/\buseEditorReadOnly\(\)/g)).toHaveLength(1);
      expect(componentSource).not.toMatch(
        /\b(?:useEditor|useEditorSelector|useEditorState|usePlateEditor|useSelectionFragmentProp)\(/
      );
      expect(componentSource).not.toMatch(
        /\b(?:editor\.children|read\.children|read\.nodes)\b/
      );
    }
  );

  it('keeps turn-into subscribed to the selected block fact', () => {
    const source = readFileSync(
      new URL('turn-into-toolbar-button.tsx', import.meta.url),
      'utf-8'
    );

    expect(source.match(/\buseSelectionFragmentProp\(/g)).toHaveLength(1);
    expect(source).not.toMatch(/\b(?:useEditorSelector|useEditorState)\(/);
    expect(source).not.toMatch(
      /\b(?:editor\.children|read\.children|read\.nodes)\b/
    );
  });
});
