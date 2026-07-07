import { createBaseEditor, getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseFontSizePlugin } from './BaseFontSizePlugin';

describe('BaseFontSizePlugin', () => {
  it('parses html font-size styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontSizePlugin],
    });
    const plugin = editor.getPlugin(BaseFontSizePlugin);
    const parse = plugin.parsers!.html!.deserializer!.parse!;

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'fontSize',
    });
    expect(
      parse({
        ...getEditorPlugin(editor, plugin),
        element: {
          style: { fontSize: '18px' },
        } as HTMLElement,
        node: {},
        type: KEYS.fontSize,
      })
    ).toEqual({
      [KEYS.fontSize]: '18px',
    });
  });

  it('sets font size through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontSizePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.fontSize.set('24px');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.fontSize]: '24px',
      text: 'text',
    });
  });
});
