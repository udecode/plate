import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

import { createEditor } from 'platejs';

import { playgroundValue } from '@/registry/examples/values/playground-value';

import { AlignKit } from './align';
import { LineHeightKit } from './line-height';
import { BaseEditorKit } from './plugins-static';

describe('BaseEditorKit', () => {
  it('reuses the server-safe formatting kits', () => {
    expect(BaseEditorKit).toContain(AlignKit[0]);
    expect(BaseEditorKit).toContain(LineHeightKit[0]);

    expect(() =>
      createEditor({
        plugins: [...AlignKit, ...LineHeightKit],
      })
    ).not.toThrow();

    for (const fileName of ['align.tsx', 'line-height.tsx']) {
      const source = readFileSync(new URL(fileName, import.meta.url), 'utf-8');

      expect(source).not.toMatch(/["']use client["']/);
      expect(source).not.toMatch(/from ["']platejs\/react["']/);
    }
  });

  it('loads and serializes the playground document used by AI requests', () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: playgroundValue,
    });

    const markdown = editor.api.markdown.serialize();

    expect(markdown).toContain('Welcome to the Plate Playground!');
    expect(markdown).toContain('<codeDrawing');
    expect(markdown).toContain('classDiagram');
  });
});
