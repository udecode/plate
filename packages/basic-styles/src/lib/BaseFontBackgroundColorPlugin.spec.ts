import { KEYS, createSlateEditor } from 'platejs';

import { BaseFontBackgroundColorPlugin } from './BaseFontBackgroundColorPlugin';

describe('BaseFontBackgroundColorPlugin', () => {
  it('parses html background-color styles into leaf marks', () => {
    const editor = createSlateEditor({
      plugins: [BaseFontBackgroundColorPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseFontBackgroundColorPlugin);
    const parse = plugin.parsers!.html!.deserializer!.parse!;

    expect(plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'backgroundColor',
    });
    expect(
      parse({
        element: {
          style: { backgroundColor: 'rgb(255, 255, 0)' },
        },
        type: KEYS.backgroundColor,
      } as any)
    ).toEqual({
      [KEYS.backgroundColor]: 'rgb(255, 255, 0)',
    });
  });

  it('forwards addMark through the editor mark transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseFontBackgroundColorPlugin],
    } as any);
    const addMarks = mock();

    (editor as any).tf.addMarks = addMarks;
    (editor as any).tf.backgroundColor.addMark('yellow');

    expect(addMarks).toHaveBeenCalledWith({
      [KEYS.backgroundColor]: 'yellow',
    });
  });
});
