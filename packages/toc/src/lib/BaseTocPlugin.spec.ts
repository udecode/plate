import { createSlateEditor, KEYS } from 'platejs';

import { BaseTocPlugin } from './BaseTocPlugin';

describe('BaseTocPlugin', () => {
  it('configures toc as a void element with the shipped defaults', () => {
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseTocPlugin);

    expect(plugin.key).toBe(KEYS.toc);
    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
    expect(plugin.options).toMatchObject({
      isScroll: true,
      topOffset: 80,
    });
  });
});
