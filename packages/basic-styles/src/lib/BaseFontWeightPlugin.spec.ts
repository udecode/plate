import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseFontWeightPlugin } from './BaseFontWeightPlugin';

describe('BaseFontWeightPlugin', () => {
  it('parses html font-weight styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontWeightPlugin],
    });
    const plugin = editor.getPlugin(BaseFontWeightPlugin);

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'fontWeight',
    });
    expect(
      editor.read.schema.property({
        key: KEYS.fontWeight,
        placement: 'text',
      })?.value.kind
    ).toBe('string');
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-weight: 700">text</span>',
      })
    ).toMatchObject([
      {
        [KEYS.fontWeight]: '700',
        text: 'text',
      },
    ]);
  });

  it('sets font weight through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontWeightPlugin],
      selection: {
        kind: 'text',
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
