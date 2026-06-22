import { createSlateEditor, KEYS } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseSlashInputPlugin, BaseSlashPlugin } from './BaseSlashPlugin';

describe('BaseSlashPlugin', () => {
  it('ships the slash trigger defaults and nested input plugin', () => {
    const editor = createSlateEditor({
      plugins: [BaseSlashPlugin],
    });
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

  it('routes the slash trigger through the Slate v2 runtime combobox path', () => {
    const editor = createPlateEditor({
      plugins: [BaseSlashPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      userId: 'user-1',
      value: [{ children: [{ text: 'hello ' }], type: 'p' }],
    });

    expect(editor.tf.insertText('/')).toBe(true);
    expect(editor.read((state) => state.value.root()) as unknown).toEqual([
      {
        children: [
          { text: 'hello ' },
          {
            children: [{ text: '' }],
            type: KEYS.slashInput,
            userId: 'user-1',
          },
          { text: '' },
        ],
        type: 'p',
      },
    ]);
  });
});
