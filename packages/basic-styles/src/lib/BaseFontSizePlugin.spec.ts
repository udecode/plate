import { KEYS, createSlateEditor } from 'platejs';

import { BaseFontSizePlugin } from './BaseFontSizePlugin';

describe('BaseFontSizePlugin', () => {
  it('parses html font-size styles into leaf marks', () => {
    const editor = createSlateEditor({
      plugins: [BaseFontSizePlugin],
    } as any);
    const plugin = editor.getPlugin(BaseFontSizePlugin);
    const parse = plugin.parsers!.html!.deserializer!.parse!;

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'fontSize',
    });
    expect(
      parse({
        element: {
          style: { fontSize: '18px' },
        },
        type: KEYS.fontSize,
      } as any)
    ).toEqual({
      [KEYS.fontSize]: '18px',
    });
  });

  it('forwards addMark through the editor mark transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseFontSizePlugin],
    } as any);
    const addMarks = mock();

    (editor as any).tf.addMarks = addMarks;
    (editor as any).tf.fontSize.addMark('24px');

    expect(addMarks).toHaveBeenCalledWith({
      [KEYS.fontSize]: '24px',
    });
  });
});
