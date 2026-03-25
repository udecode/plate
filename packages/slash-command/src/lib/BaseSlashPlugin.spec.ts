import { createSlateEditor, KEYS } from 'platejs';

import { BaseSlashInputPlugin, BaseSlashPlugin } from './BaseSlashPlugin';

describe('BaseSlashPlugin', () => {
  it('ships the slash trigger defaults and nested input plugin', () => {
    const editor = createSlateEditor({
      plugins: [BaseSlashPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseSlashPlugin);
    const inputPlugin = editor.getPlugin(BaseSlashInputPlugin);

    expect(plugin.editOnly).toBe(true);
    expect(plugin.options.trigger).toBe('/');
    expect(plugin.options.triggerPreviousCharPattern?.test('')).toBe(true);
    expect(plugin.options.triggerPreviousCharPattern?.test(' ')).toBe(true);
    expect(plugin.options.triggerPreviousCharPattern?.test('x')).toBe(false);
    expect(plugin.options.createComboboxInput?.('/')).toEqual({
      children: [{ text: '' }],
      type: KEYS.slashInput,
    });
    expect(inputPlugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isVoid: true,
    });
  });
});
