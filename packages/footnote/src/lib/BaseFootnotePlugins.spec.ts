import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteInputPlugin,
  BaseFootnotePlugin,
} from './index';
import { FootnoteInputPlugin, FootnotePlugin } from '../react';

describe('BaseFootnotePlugins', () => {
  it('declares the input as an exact required Base and React dependency', () => {
    expect(BaseFootnotePlugin.dependencies).toEqual([BaseFootnoteInputPlugin]);
    expect(FootnotePlugin.dependencies).toEqual([FootnoteInputPlugin]);
  });

  it('rejects a disabled required footnote-input dependency', () => {
    expect(() =>
      createBaseEditor({
        plugins: [
          BaseFootnotePlugin,
          BaseFootnoteInputPlugin.configure({ enabled: false }),
        ],
      })
    ).toThrow(
      /footnote.*disabled.*footnoteInput|footnoteInput.*disabled.*footnote/i
    );
  });

  it('configures footnote reference as an inline void element', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin],
    });
    const state = editor.plugin(BaseFootnotePlugin).store.get();

    expect(
      editor.read.schema.element(BaseFootnotePlugin)?.behavior.inline
    ).toBe(true);
    expect(editor.read.schema.element(BaseFootnotePlugin)?.behavior.void).toBe(
      true
    );
    expect(
      editor.read.schema.element(BaseFootnotePlugin)?.behavior.voidKind
    ).toBe('inline');
    expect(state.trigger).toBe('^');
    expect(state.triggerPreviousCharPattern?.test('[')).toBe(true);
    expect(state.triggerPreviousCharPattern?.test('x')).toBe(false);
    expect(state.createComboboxInput?.('^')).toEqual({
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
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
    });
    const api = editor.read.footnote;
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

    expect(typeof editor.update.footnote.insert).toBe('function');
    expect(typeof footnote.createDefinition).toBe('function');
    expect(typeof footnote.focusDefinition).toBe('function');
    expect(typeof footnote.focusReference).toBe('function');
    expect(typeof footnote.normalizeDuplicateDefinition).toBe('function');
  });

  it('deleteBackward removes the adjacent footnote atom', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin],
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
      plugins: [BaseFootnotePlugin],
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
      plugins: [BaseFootnotePlugin],
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
