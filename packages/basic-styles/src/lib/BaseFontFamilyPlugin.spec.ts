import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseFontFamilyPlugin } from './BaseFontFamilyPlugin';

describe('BaseFontFamilyPlugin', () => {
  it('parses html font-family styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontFamilyPlugin],
    });
    const plugin = editor.getPlugin(BaseFontFamilyPlugin);

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'fontFamily',
    });
    expect(
      editor.read.schema.property({
        key: KEYS.fontFamily,
        placement: 'text',
      })?.value.kind
    ).toBe('string');
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-family: Fira Code, monospace">text</span>',
      })
    ).toMatchObject([
      {
        [KEYS.fontFamily]: '"Fira Code", monospace',
        text: 'text',
      },
    ]);
  });

  it('sets font family through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontFamilyPlugin],
      selection: {
        kind: 'text',
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
