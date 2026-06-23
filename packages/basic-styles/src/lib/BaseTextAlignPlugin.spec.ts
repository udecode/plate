import { BaseParagraphPlugin, KEYS, createBasePlateEditor } from 'platejs';

import { BaseTextAlignPlugin } from './BaseTextAlignPlugin';

type ExpectTrue<T extends true> = T;
type IsAssignable<From, To> = From extends To ? true : false;

const runTextAlignTx = (value: string, options?: unknown) => {
  const set = mock();
  const unset = mock();
  const editor = createBasePlateEditor({
    plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
  } as any);
  const extension = (BaseTextAlignPlugin as any).__txExtensions[0];
  const groups = extension({
    plugin: BaseTextAlignPlugin,
    type: editor.getType(KEYS.textAlign),
  });

  groups[BaseTextAlignPlugin.key](
    {
      nodes: { set, unset },
    },
    editor
  ).set(value, options);

  return { set, unset };
};

describe('BaseTextAlignPlugin', () => {
  it('exposes the injected block contract and tx extension', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseTextAlignPlugin);

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    });
    expect((BaseTextAlignPlugin as any).__txExtensions).toHaveLength(1);
  });

  it('parses text-align styles through the injected target plugin deserializer', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseTextAlignPlugin);
    const targetPlugin = plugin.inject.targetPluginToInject!({
      editor,
      plugin,
    } as any);
    const parse = targetPlugin.parsers!.html!.deserializer!.parse!;
    const node: Record<string, unknown> = {};

    parse({
      element: {
        style: { textAlign: 'center' },
      },
      node,
    } as any);

    expect(node).toEqual({
      [editor.getType(KEYS.textAlign)]: 'center',
    });
  });

  it('sets and clears text alignment through node transaction commands', () => {
    const setResult = runTextAlignTx('center', { at: [] });

    expect(setResult.set).toHaveBeenCalledWith(
      { align: 'center' },
      expect.objectContaining({ at: [] })
    );
    expect(typeof setResult.set.mock.calls[0][1].match).toBe('function');
    expect(
      setResult.set.mock.calls[0][1].match(
        { children: [{ text: 'One' }], type: 'p' },
        [0]
      )
    ).toBe(true);
    expect(
      setResult.set.mock.calls[0][1].match(
        { children: [{ text: 'One' }], type: 'h1' },
        [0]
      )
    ).toBe(false);

    const unsetResult = runTextAlignTx('start', { at: [] });

    expect(unsetResult.unset).toHaveBeenCalledWith(
      'align',
      expect.objectContaining({ at: [] })
    );
  });

  it('applies text alignment through the editor update transaction', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
      value: [{ children: [{ text: 'One' }], type: 'p' }],
    });

    editor.update((tx) => {
      tx[BaseTextAlignPlugin.key].set('center', { at: [0] });

      type Tx = typeof tx;
      type TextAlignSet = Tx[typeof BaseTextAlignPlugin.key]['set'];
      type BadTextAlignValue = IsAssignable<
        'middle',
        Parameters<TextAlignSet>[0]
      >;
      // @ts-expect-error text align tx accepts only known alignment values.
      type _TextAlignRejectsMiddle = ExpectTrue<BadTextAlignValue>;
    });

    expect(editor.children[0]).toMatchObject({
      align: 'center',
      children: [{ text: 'One' }],
      type: 'p',
    });
  });
});
