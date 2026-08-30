import { createEditor, schema, PLUGINS } from '../../../core';
import {
  SlashInputPlugin,
  SlashPlugin,
} from '../../../react/features/slash-command/SlashPlugin';
import { BaseSlashInputPlugin, BaseSlashPlugin } from './BaseSlashPlugin';

describe('BaseSlashPlugin', () => {
  it('declares the input as an exact required Base and React dependency', () => {
    expect(BaseSlashPlugin.dependencies).toEqual([BaseSlashInputPlugin]);
    expect(SlashPlugin.dependencies).toEqual([SlashInputPlugin]);
  });

  it('rejects a disabled required slash-input dependency', () => {
    expect(() =>
      createEditor({
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
    const editor = createEditor({
      plugins: [BaseSlashPlugin],
    });
    const plugin = editor.plugin(BaseSlashPlugin);
    const inputPlugin = editor.plugin(BaseSlashInputPlugin);
    const state = editor.plugin(BaseSlashPlugin).store.get();

    expect(plugin.name).toBe('slashCommand');
    expect(inputPlugin.name).toBe('slashInput');
    expect(inputPlugin.name).toBe(PLUGINS.slashInput);
    expect(plugin.editOnly).toBe(true);
    expect(state.trigger).toBe('/');
    const { triggerPreviousCharPattern } = state;
    const { createComboboxInput } = state;

    if (!triggerPreviousCharPattern || !createComboboxInput) {
      throw new Error('Missing required slash plugin state');
    }

    expect(triggerPreviousCharPattern.test('')).toBe(true);
    expect(triggerPreviousCharPattern.test(' ')).toBe(true);
    expect(triggerPreviousCharPattern.test('x')).toBe(false);
    expect(createComboboxInput('/')).toEqual({
      children: [{ text: '' }],
      type: 'slashInput',
    });
    expect(
      editor.read.schema.element(BaseSlashInputPlugin)?.behavior
    ).toMatchObject({
      inline: true,
      void: true,
      voidKind: 'inline',
    });
  });

  it('creates transient inputs with the configured schema type', () => {
    const editor = createEditor({
      plugins: [BaseSlashPlugin],
      schema: {
        overrides: [
          schema.override(BaseSlashInputPlugin, {
            element: { type: 'customSlashInput' },
          }),
        ],
      },
    });

    expect(
      editor.plugin(BaseSlashPlugin).store.get('createComboboxInput')('/')
    ).toMatchObject({ type: 'customSlashInput' });
  });
});
