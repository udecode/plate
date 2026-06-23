import { KEYS, createBasePlateEditor } from 'platejs';

import { BaseFontFamilyPlugin } from './BaseFontFamilyPlugin';

const runAddMarkTx = (value: string) => {
  const add = mock();
  const extension = (BaseFontFamilyPlugin as any).__txExtensions[0];
  const groups = extension({
    plugin: BaseFontFamilyPlugin,
    type: KEYS.fontFamily,
  });

  groups[BaseFontFamilyPlugin.key]({
    marks: { add },
  }).set(value);

  return add;
};

describe('BaseFontFamilyPlugin', () => {
  it('parses html font-family styles into leaf marks', () => {
    const editor = createBasePlateEditor({
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

  it('registers set as a transaction mark add', () => {
    expect(runAddMarkTx('serif')).toHaveBeenCalledWith(
      KEYS.fontFamily,
      'serif'
    );
  });
});
