import { KEYS, createBasePlateEditor } from 'platejs';

import { BaseFontWeightPlugin } from './BaseFontWeightPlugin';

const runAddMarkTx = (value: string) => {
  const add = mock();
  const extension = (BaseFontWeightPlugin as any).__txExtensions[0];
  const groups = extension({
    plugin: BaseFontWeightPlugin,
    type: KEYS.fontWeight,
  });

  groups[BaseFontWeightPlugin.key]({
    marks: { add },
  }).set(value);

  return add;
};

describe('BaseFontWeightPlugin', () => {
  it('parses html font-weight styles into leaf marks', () => {
    const editor = createBasePlateEditor({
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

  it('registers set as a transaction mark add', () => {
    expect(runAddMarkTx('bold')).toHaveBeenCalledWith(KEYS.fontWeight, 'bold');
  });
});
