import { KEYS, createBasePlateEditor } from 'platejs';

import { BaseFontSizePlugin } from './BaseFontSizePlugin';

type ExpectTrue<T extends true> = T;
type IsAssignable<From, To> = From extends To ? true : false;

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
    const editor = createBasePlateEditor({
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

  it('applies font size through the editor update transaction', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseFontSizePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [{ children: [{ text: 'One' }], type: 'p' }],
    });

    editor.update((tx) => {
      tx[KEYS.fontSize].set('24px');

      type Tx = typeof tx;
      type FontSizeSet = Tx[typeof KEYS.fontSize]['set'];
      type BadFontSizeValue = IsAssignable<number, Parameters<FontSizeSet>[0]>;
      // @ts-expect-error font size tx expects a string value.
      type _FontSizeRejectsNumber = ExpectTrue<BadFontSizeValue>;
    });

    expect(editor.children[0].children[0]).toMatchObject({
      [KEYS.fontSize]: '24px',
      text: 'One',
    });
  });
});
