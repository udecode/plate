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
    expect(editor.read.schema.property(BaseCodeDrawingPlugin)?.value.kind).toBe(
      'json'
    );
    expect(editor.getType(KEYS.codeDrawing)).toBe(NODES.codeDrawing);
    expect(plugin.type).toBe(NODES.codeDrawing);

    editor.update((tx) => {
      expect(typeof tx.codeDrawing.insert).toBe('function');
    });
  });

  it('rejects unsupported drawing data', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeDrawingPlugin],
    });

    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [{ text: '' }],
            data: { drawingMode: 'unsupported' },
            type: NODES.codeDrawing,
          },
        ],
      })
    ).toThrow(/element property "data" fails custom property validation/);
  });

  it('inserts the default code drawing node shape after the current block', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeDrawingPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'before' }], type: 'p' }],
    });

    editor.update.codeDrawing.insert();

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'before' }], type: 'p' },
      {
        children: [{ text: '' }],
        data: {
          code: '',
          drawingMode: 'Both',
          drawingType: 'Mermaid',
        },
        type: NODES.codeDrawing,
      },
    ]);
  });

  it('merges custom data and uses the configured node type', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseCodeDrawingPlugin.configure({
          type: 'custom-code-drawing',
        }),
      ],
      initialValue: [{ children: [{ text: 'x' }], type: 'p' }],
    });

    editor.update((tx) => {
      tx.codeDrawing.insert({
        data: {
          code: 'graph TD; A-->B',
          drawingType: 'Graphviz',
        },
      });
    });

    expect(editor.read.children().at(-1)).toMatchObject({
      children: [{ text: '' }],
      data: {
        code: 'graph TD; A-->B',
        drawingMode: 'Both',
        drawingType: 'Graphviz',
      },
      type: 'custom-code-drawing',
    });
  });
});
