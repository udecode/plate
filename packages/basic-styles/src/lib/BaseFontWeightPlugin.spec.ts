import { createBaseEditor, getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseFontWeightPlugin } from './BaseFontWeightPlugin';

describe('BaseFontWeightPlugin', () => {
  it('parses html font-weight styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontWeightPlugin],
    });
    const plugin = editor.getPlugin(BaseFontWeightPlugin);
    const parse = plugin.parsers!.html!.deserializer!.parse!;

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'fontWeight',
    });
    expect(
      parse({
        ...getEditorPlugin(editor, plugin),
        element: {
          style: { fontWeight: '700' },
        } as HTMLElement,
        node: {},
        type: KEYS.fontWeight,
      })
    ).toEqual({
      [KEYS.fontWeight]: '700',
    });
  });

  it('sets font weight through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontWeightPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.fontWeight.set('bold');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.fontWeight]: 'bold',
      text: 'text',
    });
  });
});
