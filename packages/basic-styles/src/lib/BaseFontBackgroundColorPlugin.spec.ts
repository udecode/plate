import { createBaseEditor, getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseFontBackgroundColorPlugin } from './BaseFontBackgroundColorPlugin';

describe('BaseFontBackgroundColorPlugin', () => {
  it('parses html background-color styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontBackgroundColorPlugin],
    });
    const plugin = editor.getPlugin(BaseFontBackgroundColorPlugin);
    const parse = plugin.parsers!.html!.deserializer!.parse!;

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'backgroundColor',
    });
    expect(
      parse({
        ...getEditorPlugin(editor, plugin),
        element: {
          style: { backgroundColor: 'rgb(255, 255, 0)' },
        } as HTMLElement,
        node: {},
        type: KEYS.backgroundColor,
      })
    ).toEqual({
      [KEYS.backgroundColor]: 'rgb(255, 255, 0)',
    });
  });

  it('sets background color through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontBackgroundColorPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.backgroundColor.set('yellow');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.backgroundColor]: 'yellow',
      text: 'text',
    });
  });
});
