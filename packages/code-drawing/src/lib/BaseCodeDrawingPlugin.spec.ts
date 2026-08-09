import { createBaseEditor } from '@platejs/core';
import { PLUGINS } from '@platejs/utils';

import { BaseCodeDrawingPlugin } from './BaseCodeDrawingPlugin';

describe('BaseCodeDrawingPlugin', () => {
  it('uses a camelCase command identity without changing serialized nodes', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeDrawingPlugin],
    });

    const plugin = editor.plugin(BaseCodeDrawingPlugin);
    const element = { children: [{ text: '' }], type: 'codeDrawing' };

    expect(plugin.name).toBe('codeDrawing');
    expect(editor.read.schema.isBlock(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(
      editor.read.schema.property({ key: 'data', placement: 'element' })?.value
        .kind
    ).toBe('json');
    expect(editor.plugin(PLUGINS.codeDrawing).name).toBe(PLUGINS.codeDrawing);
    expect(plugin.name).toBe(PLUGINS.codeDrawing);

    expect(typeof plugin.update.insert).toBe('function');
  });

  it('rejects unsupported drawing data', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeDrawingPlugin],
    });

    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ text: '' }],
            data: { drawingMode: 'unsupported' },
            type: 'codeDrawing',
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
      initialValue: [{ children: [{ text: 'before' }], type: 'paragraph' }],
    });

    editor.plugin(BaseCodeDrawingPlugin).update.insert();

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'before' }], type: 'paragraph' },
      {
        children: [{ text: '' }],
        data: {
          code: '',
          drawingMode: 'Both',
          drawingType: 'Mermaid',
        },
        type: 'codeDrawing',
      },
    ]);
  });

  it('merges custom data with the defaults', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeDrawingPlugin],
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    editor.plugin(BaseCodeDrawingPlugin).update.insert(
      {
        data: {
          code: 'graph TD; A-->B',
          drawingMode: 'Both',
          drawingType: 'Graphviz',
        },
      },
      { at: [1] }
    );

    expect(editor.read.children().at(-1)).toMatchObject({
      children: [{ text: '' }],
      data: {
        code: 'graph TD; A-->B',
        drawingMode: 'Both',
        drawingType: 'Graphviz',
      },
      type: 'codeDrawing',
    });
  });
});
