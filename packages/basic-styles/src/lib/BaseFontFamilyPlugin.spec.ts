import { KEYS, createSlateEditor } from 'platejs';

import { BaseFontFamilyPlugin } from './BaseFontFamilyPlugin';

describe('BaseFontFamilyPlugin', () => {
  it('parses html font-family styles into leaf marks', () => {
    const editor = createSlateEditor({
      plugins: [BaseFontFamilyPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseFontFamilyPlugin);
    const parse = plugin.parsers!.html!.deserializer!.parse!;

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'fontFamily',
    });
    expect(
      parse({
        element: {
          style: { fontFamily: '"Fira Code", monospace' },
        },
        type: KEYS.fontFamily,
      } as any)
    ).toEqual({
      [KEYS.fontFamily]: '"Fira Code", monospace',
    });
  });

  it('forwards addMark through the editor mark transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseFontFamilyPlugin],
    } as any);
    const addMarks = mock();

    (editor as any).tf.addMarks = addMarks;
    (editor as any).tf.fontFamily.addMark('serif');

    expect(addMarks).toHaveBeenCalledWith({
      [KEYS.fontFamily]: 'serif',
    });
  });
});
