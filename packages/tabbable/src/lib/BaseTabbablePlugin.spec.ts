import { createSlateEditor } from 'platejs';

import { BaseTabbablePlugin } from './BaseTabbablePlugin';

describe('BaseTabbablePlugin', () => {
  it('ships the default options and delegates tabbable checks to isVoid', () => {
    const editor = createSlateEditor({
      plugins: [BaseTabbablePlugin],
    } as any);
    const plugin = editor.getPlugin(BaseTabbablePlugin);
    const voidNode = { children: [{ text: '' }], type: 'void' };
    const textNode = { text: 'a' };
    const isVoid = mock((node) => node === voidNode);

    (editor.api as any).isVoid = isVoid;

    expect(plugin.options.globalEventListener).toBe(false);
    expect(plugin.options.insertTabbableEntries?.({} as any)).toEqual([]);
    expect(plugin.options.query?.({} as any)).toBe(true);
    expect(plugin.options.isTabbable?.({ slateNode: voidNode } as any)).toBe(
      true
    );
    expect(plugin.options.isTabbable?.({ slateNode: textNode } as any)).toBe(
      false
    );
    expect(isVoid).toHaveBeenCalledTimes(2);
  });
});
