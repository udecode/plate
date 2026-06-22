import { KEYS, createSlateEditor } from 'platejs';

import { BaseFontColorPlugin } from './BaseFontColorPlugin';

const runAddMarkTx = (value: string) => {
  const add = mock();
  const extension = (BaseFontColorPlugin as any).__txExtensions[0];
  const groups = extension({
    plugin: BaseFontColorPlugin,
    type: KEYS.color,
  });

  groups[BaseFontColorPlugin.key]({
    marks: { add },
  }).set(value);

  return add;
};

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

  it('registers set as a transaction mark add', () => {
    expect(runAddMarkTx('red')).toHaveBeenCalledWith(KEYS.color, 'red');
  });
});
