import { createEditor, PLUGINS } from '../../core';
import { BaseExcalidrawPlugin } from './BaseExcalidrawPlugin';

describe('BaseExcalidrawPlugin', () => {
  it('registers excalidraw as a void element plugin', () => {
    const editor = createEditor({
      plugins: [BaseExcalidrawPlugin],
    });
    const plugin = editor.plugin(BaseExcalidrawPlugin);
    const element = { children: [{ text: '' }], type: 'excalidraw' };

    expect(plugin.name).toBe(PLUGINS.excalidraw);
    expect(editor.read.schema.isBlock(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(
      editor.read.schema.property({
        key: 'data',
        placement: 'element',
        type: 'excalidraw',
      })?.value.kind
    ).toBe('json');
  });

  it.each([
    ['settings as a list', { elements: [], state: [] }],
    ['images as text', { elements: [], files: 'image', state: {} }],
    ['images as a list', { elements: [], files: [], state: {} }],
    ['images as null', { elements: [], files: null, state: {} }],
  ])('rejects drawing data with %s', (_, data) => {
    const editor = createEditor({
      plugins: [BaseExcalidrawPlugin],
    });

    expect(() =>
      editor.read.schema.assertDocument({
        children: [{ children: [{ text: '' }], data, type: 'excalidraw' }],
      })
    ).toThrow(/element property "data" fails custom property validation/);
  });

  it('does nothing without a selection or explicit target', () => {
    const editor = createEditor({
      plugins: [BaseExcalidrawPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.plugin(BaseExcalidrawPlugin).update.insert();

    expect(editor.read.children()).toHaveLength(1);
  });

  it('inserts at an exact explicit target without a selection', () => {
    const editor = createEditor({
      plugins: [BaseExcalidrawPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.plugin(BaseExcalidrawPlugin).update.insert({}, { at: [0] });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: '' }], type: 'excalidraw' },
      { type: 'paragraph' },
    ]);
  });
});
