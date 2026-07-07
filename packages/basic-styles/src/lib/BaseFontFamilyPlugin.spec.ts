import { createBaseEditor, getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseFontFamilyPlugin } from './BaseFontFamilyPlugin';

describe('BaseFontFamilyPlugin', () => {
  it('parses html font-family styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontFamilyPlugin],
    });
    const plugin = editor.getPlugin(BaseFontFamilyPlugin);
    const parse = plugin.parsers!.html!.deserializer!.parse!;

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'fontFamily',
    });
    expect(
      parse({
        ...getEditorPlugin(editor, plugin),
        element: {
          style: { fontFamily: '"Fira Code", monospace' },
        } as HTMLElement,
        node: {},
        type: KEYS.fontFamily,
      })
    ).toEqual({
      [KEYS.fontFamily]: '"Fira Code", monospace',
    });
  });

  it('sets font family through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontFamilyPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.fontFamily.set('serif');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.fontFamily]: 'serif',
      text: 'text',
    });
  });
});
