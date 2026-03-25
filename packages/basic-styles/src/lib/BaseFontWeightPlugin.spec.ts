import { KEYS, createSlateEditor } from 'platejs';

import { BaseFontWeightPlugin } from './BaseFontWeightPlugin';

describe('BaseFontWeightPlugin', () => {
  it('parses html font-weight styles into leaf marks', () => {
    const editor = createSlateEditor({
      plugins: [BaseFontWeightPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseFontWeightPlugin);
    const parse = plugin.parsers!.html!.deserializer!.parse!;

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'fontWeight',
    });
    expect(
      parse({
        element: {
          style: { fontWeight: '700' },
        },
        type: KEYS.fontWeight,
      } as any)
    ).toEqual({
      [KEYS.fontWeight]: '700',
    });
  });

  it('forwards addMark through the editor mark transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseFontWeightPlugin],
    } as any);
    const addMarks = mock();

    (editor as any).tf.addMarks = addMarks;
    (editor as any).tf.fontWeight.addMark('bold');

    expect(addMarks).toHaveBeenCalledWith({
      [KEYS.fontWeight]: 'bold',
    });
  });
});
