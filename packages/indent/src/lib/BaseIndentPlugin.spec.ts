import { BaseParagraphPlugin, KEYS, createSlateEditor } from 'platejs';

import { BaseIndentPlugin } from './BaseIndentPlugin';

describe('BaseIndentPlugin', () => {
  it('exposes the default options and injected node-prop contract', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
    });
    const plugin = editor.getPlugin(BaseIndentPlugin);
    const nodeProps = plugin.inject.nodeProps!;

    expect(editor.getOptions(BaseIndentPlugin)).toEqual({
      offset: 24,
      unit: 'px',
    });
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(nodeProps.nodeKey).toBe('indent');
    expect(nodeProps.styleKey).toBe('marginLeft');
    expect(
      nodeProps.transformNodeValue!({
        getOptions: () => editor.getOptions(BaseIndentPlugin),
        nodeValue: 2,
      } as any)
    ).toBe('48px');
  });
});
