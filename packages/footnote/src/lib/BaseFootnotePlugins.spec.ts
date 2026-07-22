import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteInputPlugin,
  BaseFootnoteReferencePlugin,
} from './index';

describe('BaseFootnotePlugins', () => {
  it('configures footnote reference as an inline void element', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnoteReferencePlugin],
    });
    const options = editor.plugin(BaseFootnoteReferencePlugin).getOptions();

    expect(
      editor.read.schema.element(BaseFootnoteReferencePlugin)?.behavior.inline
    ).toBe(true);
    expect(
      editor.read.schema.element(BaseFootnoteReferencePlugin)?.behavior.void
    ).toBe(true);
    expect(
      editor.read.schema.element(BaseFootnoteReferencePlugin)?.behavior.voidKind
    ).toBe('inline');
    expect(options.trigger).toBe('^');
    expect(options.triggerPreviousCharPattern?.test('[')).toBe(true);
    expect(options.triggerPreviousCharPattern?.test('x')).toBe(false);
    expect(options.createComboboxInput?.('^')).toEqual({
      children: [{ text: '' }],
      type: 'footnoteInput',
    });
    expect(
      editor.read.schema.element(BaseFootnoteInputPlugin)?.behavior
    ).toMatchObject({
      inline: true,
      void: true,
      voidKind: 'inline',
    });
    expect(
      editor.read.schema.getElementBehavior({
        children: [{ text: '' }],
        type: KEYS.footnoteReference,
      })
    ).toMatchObject({ atom: true, inline: true, void: true });
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [{ text: '' }],
            type: KEYS.footnoteReference,
          },
        ],
      })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
  });

  it('configures footnote definition as a block element', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnoteDefinitionPlugin],
    });
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.content
        ?.allowsText
    ).toBe(false);
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.content?.min
    ).toBe(1);
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.behavior.inline
    ).toBe(false);
    expect(
      editor.read.schema.createAndFill(BaseFootnoteDefinitionPlugin)
    ).toEqual({
      children: [{ children: [{ text: '' }], type: KEYS.p }],
      type: KEYS.footnoteDefinition,
    });
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.groups
    ).toContain('block');
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [{ children: [{ text: '' }], type: KEYS.p }],
            type: KEYS.footnoteDefinition,
          },
        ],
      })
    ).not.toThrow();
  });

  it('provides footnote api and insert / navigation transforms on the editor', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
    });
    const api = editor.api.footnote;
    const footnote = editor.update.footnote;

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

    expect(editor.update.insert).toBeDefined();
    expect(typeof editor.update.insert.footnote).toBe('function');
    expect(typeof footnote.createDefinition).toBe('function');
    expect(typeof footnote.focusDefinition).toBe('function');
    expect(typeof footnote.focusReference).toBe('function');
    expect(typeof footnote.normalizeDuplicateDefinition).toBe('function');
  });

  it('deleteBackward removes the adjacent footnote atom', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnoteReferencePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
      initialValue: [
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
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'p',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next footnote atom', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnoteReferencePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
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
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'p',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('typing "^" after "[" inserts a footnote combobox input', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnoteReferencePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: '[' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.text.insert('^');

    expect(editor.read.value().children).toMatchObject([
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
