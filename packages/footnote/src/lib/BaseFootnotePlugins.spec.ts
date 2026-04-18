import { createSlateEditor, KEYS } from 'platejs';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteInputPlugin,
  BaseFootnoteReferencePlugin,
} from './index';

describe('BaseFootnotePlugins', () => {
  it('configures footnote reference as an inline void element', () => {
    const editor = createSlateEditor({
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
    const editor = createSlateEditor({
      plugins: [BaseFootnoteDefinitionPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseFootnoteDefinitionPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
    });
    expect(plugin.node.isInline).toBeUndefined();
  });

  it('provides footnote api and insert / navigation transforms on the editor', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
    } as any);
    const api = (editor.api as any).footnote;
    const insert = (editor.tf as any).insert;
    const footnote = (editor.tf as any).footnote;

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

    expect(insert).toBeDefined();
    expect(typeof insert.footnote).toBe('function');
    expect(typeof footnote.createDefinition).toBe('function');
    expect(typeof footnote.focusDefinition).toBe('function');
    expect(typeof footnote.focusReference).toBe('function');
    expect(typeof footnote.normalizeDuplicateDefinition).toBe('function');
  });

  it('deleteBackward removes the adjacent footnote atom', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
      value: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              identifier: '1',
              type: 'footnoteReference',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
    } as any);

    editor.tf.deleteBackward('character');

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'p',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next footnote atom', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin],
      selection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              identifier: '1',
              type: 'footnoteReference',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
    } as any);

    editor.tf.deleteForward('character');

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'p',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('typing "^" after "[" inserts a footnote combobox input', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '[' }],
          type: KEYS.p,
        },
      ],
    } as any);

    editor.tf.insertText('^');

    expect(editor.children).toMatchObject([
      {
        children: [
          { text: '[' },
          {
            children: [{ text: '' }],
            type: 'footnoteInput',
          },
          { text: '' },
        ],
        type: KEYS.p,
      },
    ]);
  });
});
