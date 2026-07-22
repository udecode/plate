import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseFontSizePlugin } from './BaseFontSizePlugin';

describe('BaseFontSizePlugin', () => {
  it('parses html font-size styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontSizePlugin],
    });
    const plugin = editor.getPlugin(BaseFontSizePlugin);

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'fontSize',
    });
    expect(editor.read.schema.property(BaseFontSizePlugin)?.value.kind).toBe(
      'string'
    );
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-size: 18px">text</span>',
      })
    ).toMatchObject([
      {
        [KEYS.fontSize]: '18px',
        text: 'text',
      },
    ]);
  });

  it('sets font size through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontSizePlugin],
      selection: {
        kind: 'text',
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
