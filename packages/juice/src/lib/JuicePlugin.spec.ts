import { createSlateEditor, KEYS } from 'platejs';

import { JuicePlugin } from './JuicePlugin';

describe('JuicePlugin', () => {
  it('removes commented style guards before inlining css', () => {
    const editor = createSlateEditor({
      plugins: [JuicePlugin],
    } as any);
    const plugin = editor.getPlugin(JuicePlugin);
    const transformData =
      plugin.inject.plugins?.[KEYS.html]?.parser?.transformData;

    if (!transformData) {
      throw new Error('Missing HTML parser transformData');
    }

    const result = transformData({
      data: '<style><!-- .x { color: red; } --></style><p class="x">a</p>',
    } as any);

    expect(result).toContain('style="color: red;"');
    expect(result).not.toContain('<!--');
  });

  it('leaves plain html alone when there is nothing to inline', () => {
    const editor = createSlateEditor({
      plugins: [JuicePlugin],
    } as any);
    const plugin = editor.getPlugin(JuicePlugin);
    const transformData =
      plugin.inject.plugins?.[KEYS.html]?.parser?.transformData;

    if (!transformData) {
      throw new Error('Missing HTML parser transformData');
    }

    expect(transformData({ data: '<p>a</p>' } as any)).toBe('<p>a</p>');
  });
});
