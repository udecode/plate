import { describe, expect, it } from 'bun:test';

import { createEditor } from 'platejs';

import { playgroundValue } from '@/registry/examples/values/playground-value';

import { BaseEditorKit } from './plugins-static';

describe('BaseEditorKit', () => {
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
