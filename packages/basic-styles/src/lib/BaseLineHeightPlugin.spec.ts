import { BaseParagraphPlugin, KEYS, createBasePlateEditor } from 'platejs';

import { BaseLineHeightPlugin } from './BaseLineHeightPlugin';

const runLineHeightTx = (value: number, options?: unknown) => {
  const set = mock();
  const unset = mock();
  const editor = createBasePlateEditor({
    plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
  } as any);
  const extension = (BaseLineHeightPlugin as any).__txExtensions[0];
  const groups = extension({
    plugin: BaseLineHeightPlugin,
    type: KEYS.lineHeight,
  });

  groups[BaseLineHeightPlugin.key](
    {
      nodes: { set, unset },
    },
    editor
  ).set(value, options);

  return { set, unset };
};

describe('BaseLineHeightPlugin', () => {
  it('exposes the injected block contract and tx extension', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseLineHeightPlugin);

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
    });
    expect((BaseLineHeightPlugin as any).__txExtensions).toHaveLength(1);
  });

  it('parses line-height styles through the injected target plugin deserializer', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseLineHeightPlugin);
    const targetPlugin = plugin.inject.targetPluginToInject!({
      editor,
      plugin,
    } as any);
    const parse = targetPlugin.parsers!.html!.deserializer!.parse!;

    expect(
      parse({
        element: {
          style: { lineHeight: '2' },
        },
      } as any)
    ).toEqual({
      [editor.getType(KEYS.lineHeight)]: '2',
    });
  });

  it('sets and clears line height through node transaction commands', () => {
    const setResult = runLineHeightTx(2, { at: [] });

    expect(setResult.set).toHaveBeenCalledWith(
      { lineHeight: 2 },
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

    const unsetResult = runLineHeightTx(1.5, { at: [] });

    expect(unsetResult.unset).toHaveBeenCalledWith(
      'lineHeight',
      expect.objectContaining({ at: [] })
    );
  });
});
