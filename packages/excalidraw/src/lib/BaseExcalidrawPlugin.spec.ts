import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseExcalidrawPlugin } from './BaseExcalidrawPlugin';

describe('BaseExcalidrawPlugin', () => {
  it('registers excalidraw as a void element plugin', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
    });
    const plugin = editor.plugin(BaseExcalidrawPlugin).plugin;
    const element = { children: [{ text: '' }], type: KEYS.excalidraw };

    expect(plugin.name).toBe(KEYS.excalidraw);
    expect(editor.read.schema.isBlock(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(
      editor.read.schema.property({
        key: 'data',
        placement: 'element',
        type: KEYS.excalidraw,
      })?.value.kind
    ).toBe('json');
    expect(editor.plugin(KEYS.excalidraw).type).toBe(KEYS.excalidraw);
  });

  it('rejects malformed drawing data', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
    });

    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ text: '' }],
            data: { elements: [], state: [] },
            type: KEYS.excalidraw,
          },
        ],
      })
    ).toThrow(/element property "data" fails custom property validation/);
  });

  it('accepts the persisted drawing width', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
    });

    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ text: '' }],
            data: { elements: [], state: {} },
            type: KEYS.excalidraw,
            width: '50%',
          },
        ],
      })
    ).not.toThrow();
  });

  it('does nothing without a selection or explicit target', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update.excalidraw.insert();

    expect(editor.read.children()).toHaveLength(1);
  });

  it('inserts after an explicit block target without a selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update.excalidraw.insert({}, { at: [0] });

    expect(editor.read.children()).toMatchObject([
      { type: 'p' },
      { children: [{ text: '' }], type: KEYS.excalidraw },
    ]);
  });

  it('publishes insertion on the active transaction group', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update((tx) => {
      tx.excalidraw.insert(
        { data: { elements: [], state: { theme: 'dark' } } },
        { select: true }
      );
    });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: '' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        data: { elements: [], state: { theme: 'dark' } },
        type: KEYS.excalidraw,
      },
    ]);
  });
});
