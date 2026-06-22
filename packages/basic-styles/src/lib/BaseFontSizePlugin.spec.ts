import { KEYS, createSlateEditor } from 'platejs';

import { BaseFontSizePlugin } from './BaseFontSizePlugin';

const runAddMarkTx = (value: string) => {
  const add = mock();
  const extension = (BaseFontSizePlugin as any).__txExtensions[0];
  const groups = extension({
    plugin: BaseFontSizePlugin,
    type: KEYS.fontSize,
  });

  groups[BaseFontSizePlugin.key]({
    marks: { add },
  }).set(value);

  return add;
};

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

  it('registers set as a transaction mark add', () => {
    expect(runAddMarkTx('24px')).toHaveBeenCalledWith(KEYS.fontSize, '24px');
  });
});
