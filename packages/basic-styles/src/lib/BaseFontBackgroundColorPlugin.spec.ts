import { KEYS, createBasePlateEditor } from 'platejs';

import { BaseFontBackgroundColorPlugin } from './BaseFontBackgroundColorPlugin';

const runAddMarkTx = (value: string) => {
  const add = mock();
  const extension = (BaseFontBackgroundColorPlugin as any).__txExtensions[0];
  const groups = extension({
    plugin: BaseFontBackgroundColorPlugin,
    type: KEYS.backgroundColor,
  });

  groups[BaseFontBackgroundColorPlugin.key]({
    marks: { add },
  }).set(value);

  return add;
};

describe('BaseFontBackgroundColorPlugin', () => {
  it('parses html background-color styles into leaf marks', () => {
    const editor = createBasePlateEditor({
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

  it('registers set as a transaction mark add', () => {
    expect(runAddMarkTx('yellow')).toHaveBeenCalledWith(
      KEYS.backgroundColor,
      'yellow'
    );
  });
});
