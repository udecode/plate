import { createBaseEditor } from '@platejs/core';
import { NODES } from '@platejs/utils';

import { BaseSlashInputPlugin, BaseSlashPlugin } from './BaseSlashPlugin';
import { SlashInputPlugin, SlashPlugin } from '../react/SlashPlugin';

describe('BaseSlashPlugin', () => {
  it('declares the input as an exact required Base and React dependency', () => {
    expect(BaseSlashPlugin.dependencies).toEqual([BaseSlashInputPlugin]);
    expect(SlashPlugin.dependencies).toEqual([SlashInputPlugin]);
  });

  it('rejects a disabled required slash-input dependency', () => {
    expect(() =>
      createBaseEditor({
        plugins: [
          BaseSlashPlugin,
          BaseSlashInputPlugin.configure({ enabled: false }),
        ],
      })
    ).toThrow(
      /slashCommand.*disabled.*slashInput|slashInput.*disabled.*slashCommand/i
    );
  });

  it('ships the slash trigger defaults and required input plugin', () => {
    const editor = createBaseEditor({
      plugins: [BaseSlashPlugin],
    });
    const plugin = editor.plugin(BaseSlashPlugin).plugin;
    const inputPlugin = editor.plugin(BaseSlashInputPlugin).plugin;
    const state = editor.plugin(BaseSlashPlugin).store.get();

    expect(plugin.name).toBe('slashCommand');
    expect(inputPlugin.name).toBe('slashInput');
    expect(inputPlugin.type).toBe(NODES.slashInput);
    expect(plugin.editOnly).toBe(true);
    expect(state.trigger).toBe('/');
    const triggerPreviousCharPattern = state.triggerPreviousCharPattern;
    const createComboboxInput = state.createComboboxInput;

    if (!triggerPreviousCharPattern || !createComboboxInput) {
      throw new Error('Missing required slash plugin state');
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
