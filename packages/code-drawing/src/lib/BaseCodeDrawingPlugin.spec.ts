import { createBaseEditor } from '@platejs/core';
import { KEYS, NODES } from '@platejs/utils';

import { BaseCodeDrawingPlugin } from './BaseCodeDrawingPlugin';

describe('BaseCodeDrawingPlugin', () => {
  it('uses a camelCase command identity without changing serialized nodes', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeDrawingPlugin],
    });

    const plugin = editor.getPlugin(BaseCodeDrawingPlugin);
    const element = { children: [{ text: '' }], type: NODES.codeDrawing };

    expect(plugin.key).toBe('codeDrawing');
    expect(editor.read.schema.isBlock(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(
      editor.read.schema.property({
        key: 'data',
        placement: 'element',
        type: NODES.codeDrawing,
      })?.value.kind
    ).toBe('json');
    expect(editor.getType(KEYS.codeDrawing)).toBe(NODES.codeDrawing);
    expect(plugin.node.type).toBe(NODES.codeDrawing);

    editor.update((tx) => {
      expect(typeof tx.codeDrawing.insert).toBe('function');
    });
  });
});
