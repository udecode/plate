import { createBaseEditor } from '@platejs/core';
import { NODES } from '@platejs/utils';

import { BaseSlashInputPlugin, BaseSlashPlugin } from './BaseSlashPlugin';

describe('BaseSlashPlugin', () => {
  it('ships the slash trigger defaults and nested input plugin', () => {
    const editor = createBaseEditor({
      plugins: [BaseSlashPlugin],
    });
    const plugin = editor.getPlugin(BaseSlashPlugin);
    const inputPlugin = editor.getPlugin(BaseSlashInputPlugin);

    expect(plugin.key).toBe('slashCommand');
    expect(inputPlugin.key).toBe('slashInput');
    expect(inputPlugin.type).toBe(NODES.slashInput);
    expect(plugin.editOnly).toBe(true);
    expect(plugin.options.trigger).toBe('/');
    const triggerPreviousCharPattern =
      plugin.options.triggerPreviousCharPattern;
    const createComboboxInput = plugin.options.createComboboxInput;

    if (!triggerPreviousCharPattern || !createComboboxInput) {
      throw new Error('Missing required slash plugin options');
    }

    expect(triggerPreviousCharPattern.test('')).toBe(true);
    expect(triggerPreviousCharPattern.test(' ')).toBe(true);
    expect(triggerPreviousCharPattern.test('x')).toBe(false);
    expect(createComboboxInput('/')).toEqual({
      children: [{ text: '' }],
      type: NODES.slashInput,
    });
    expect(
      editor.read.schema.element(BaseSlashInputPlugin)?.behavior
    ).toMatchObject({
      inline: true,
      void: true,
      voidKind: 'inline',
    });
  });
});
