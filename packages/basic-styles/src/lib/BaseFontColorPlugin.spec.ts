import { createBaseEditor, getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseFontColorPlugin } from './BaseFontColorPlugin';

describe('BaseFontColorPlugin', () => {
  it('parses html color styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontColorPlugin],
    });
    const plugin = editor.getPlugin(BaseFontColorPlugin);
    const parse = plugin.parsers!.html!.deserializer!.parse!;

    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 'black',
      nodeKey: 'color',
    });
    expect(
      parse({
        ...getEditorPlugin(editor, plugin),
        element: {
          style: { color: 'rgb(255, 0, 0)' },
        } as HTMLElement,
        node: {},
        type: KEYS.color,
      })
    ).toEqual({
      [KEYS.color]: 'rgb(255, 0, 0)',
    });
  });

  it('sets font color through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontColorPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.color.set('red');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.color]: 'red',
      text: 'text',
    });
  });
});
