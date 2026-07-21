import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseFontBackgroundColorPlugin } from './BaseFontBackgroundColorPlugin';

describe('BaseFontBackgroundColorPlugin', () => {
  it('parses html background-color styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontBackgroundColorPlugin],
    });
    const plugin = editor.getPlugin(BaseFontBackgroundColorPlugin);

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'backgroundColor',
    });
    expect(
      editor.read.schema.property({
        key: KEYS.backgroundColor,
        placement: 'text',
      })?.value.kind
    ).toBe('string');
    expect(
      editor.api.html.deserialize({
        element: '<span style="background-color: rgb(255, 255, 0)">text</span>',
      })
    ).toMatchObject([
      {
        [KEYS.backgroundColor]: 'rgb(255, 255, 0)',
        text: 'text',
      },
    ]);
  });

  it('sets background color through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontBackgroundColorPlugin],
      selection: {
        kind: 'text',
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
