import { createBasePlateEditor } from 'platejs';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteInputPlugin,
  BaseFootnoteReferencePlugin,
} from './index';

describe('BaseFootnotePlugins', () => {
  it('configures footnote reference as an inline void element', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseFootnoteReferencePlugin],
    } as any);
    const plugin = editor.getPlugin(BaseFootnoteReferencePlugin);
    const inputPlugin = editor.getPlugin(BaseFootnoteInputPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isVoid: true,
    });
    expect(plugin.options.trigger).toBe('^');
    expect(plugin.options.triggerPreviousCharPattern?.test('[')).toBe(true);
    expect(plugin.options.triggerPreviousCharPattern?.test('x')).toBe(false);
    expect(plugin.options.createComboboxInput?.('^')).toEqual({
      children: [{ text: '' }],
      type: 'footnoteInput',
    });
    expect(inputPlugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isVoid: true,
    });
  });

  it('configures footnote definition as a block element', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseFootnoteDefinitionPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseFootnoteDefinitionPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
    });
    expect(plugin.node.isInline).toBeUndefined();
  });

  it('provides footnote api on the editor', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
    } as any);
    const api = (editor.api as any).footnote;

    expect(api).toBeDefined();
    expect(typeof api.nextId).toBe('function');
    expect(typeof api.definition).toBe('function');
    expect(typeof api.definitions).toBe('function');
    expect(typeof api.duplicateDefinitions).toBe('function');
    expect(typeof api.references).toBe('function');
    expect(typeof api.identifiers).toBe('function');
    expect(typeof api.isDuplicateDefinition).toBe('function');
    expect(typeof api.isResolved).toBe('function');
    expect(typeof api.hasDuplicateDefinitions).toBe('function');
    expect(typeof api.duplicateIdentifiers).toBe('function');
  });

  it('marks the reference plugin for runtime footnote and combobox support', () => {
    expect(BaseFootnoteReferencePlugin.runtimeFootnote).toBe(true);
    expect(BaseFootnoteReferencePlugin.runtimeTriggerCombobox).toBe(true);
  });
});
