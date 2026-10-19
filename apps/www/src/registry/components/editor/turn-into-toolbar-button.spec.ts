import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

describe('composed toolbar registry', () => {
  it.each([
    ['fixed-toolbar', 'FixedToolbarButtons', 'export function FixedToolbar('],
    [
      'floating-toolbar',
      'FloatingToolbarButtons',
      'export function FloatingToolbar(',
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
        /\b(?:useEditorSelector|useEditorState|useSelectionFragmentProp)\(/
      );
      expect(componentSource).not.toMatch(
        /\b(?:editor\.children|read\.children|read\.nodes)\b/
      );
    }
  );
});
