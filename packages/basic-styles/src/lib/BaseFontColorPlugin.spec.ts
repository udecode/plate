import { KEYS, createSlateEditor } from 'platejs';

import { BaseFontColorPlugin } from './BaseFontColorPlugin';

describe('BaseFontColorPlugin', () => {
  it('parses html color styles into leaf marks', () => {
    const editor = createSlateEditor({
      plugins: [BaseFontColorPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseFontColorPlugin);
    const parse = plugin.parsers!.html!.deserializer!.parse!;

    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 'black',
      nodeKey: 'color',
    });
    expect(
      parse({
        element: {
          style: { color: 'rgb(255, 0, 0)' },
        },
        type: KEYS.color,
      } as any)
    ).toEqual({
      [KEYS.color]: 'rgb(255, 0, 0)',
    });
  });

  it('forwards addMark through the editor mark transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseFontColorPlugin],
    } as any);
    const addMarks = mock();

    (editor as any).tf.addMarks = addMarks;
    (editor as any).tf.color.addMark('red');

    expect(addMarks).toHaveBeenCalledWith({
      [KEYS.color]: 'red',
    });
  });
});
