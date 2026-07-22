import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseFontColorPlugin } from './BaseFontColorPlugin';

describe('BaseFontColorPlugin', () => {
  it('parses html color styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontColorPlugin],
    });
    const plugin = editor.getPlugin(BaseFontColorPlugin);

    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 'black',
      nodeKey: 'color',
    });
    expect(editor.read.schema.property(BaseFontColorPlugin)?.value.kind).toBe(
      'string'
    );
    expect(
      editor.api.html.deserialize({
        element: '<span style="color: rgb(255, 0, 0)">text</span>',
      })
    ).toMatchObject([
      {
        [KEYS.color]: 'rgb(255, 0, 0)',
        text: 'text',
      },
    ]);
  });

  it('sets font color through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontColorPlugin],
      selection: {
        kind: 'text',
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
