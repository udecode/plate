import type { Selection, Value } from '@platejs/plite';
import { createBaseEditor } from '@platejs/core';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteReferencePlugin,
} from './index';

const createFootnoteRuntimeEditor = ({
  selection,
  value,
}: {
  selection?: Selection;
  value: Value;
}) =>
  createBaseEditor({
    plugins: [
      BaseFootnoteReferencePlugin,
      BaseFootnoteDefinitionPlugin,
    ] as const,
    selection,
    initialValue: value,
  });

describe('BaseFootnoteReferencePlugin Plite runtime', () => {
  it('exposes footnote registry api from the runtime document', () => {
    const editor = createFootnoteRuntimeEditor({
      value: [
        {
          children: [
            {
              children: [{ text: '' }],
              identifier: '1',
              type: 'footnoteReference',
            },
          ],
          type: 'p',
        },
        {
          children: [{ children: [{ text: 'body' }], type: 'p' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'duplicate' }], type: 'p' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const { footnote } = editor.api;

    expect(footnote.definition({ identifier: '1' })?.[1]).toEqual([1]);
    expect(footnote.definitions({ identifier: '1' })).toHaveLength(2);
    expect(footnote.references({ identifier: '1' })).toHaveLength(1);
    expect(footnote.definitionText({ identifier: '1' })).toBe('body');
    expect(footnote.isResolved({ identifier: '1' })).toBe(true);
    expect(footnote.hasDuplicateDefinitions({ identifier: '1' })).toBe(true);
    expect(footnote.duplicateDefinitions({ identifier: '1' })).toHaveLength(1);
    expect(footnote.duplicateIdentifiers()).toEqual(['1']);
    expect(footnote.identifiers()).toEqual(['1']);
    expect(footnote.nextId()).toBe('2');
  });

  it('renumbers duplicate definitions through the runtime transaction group', () => {
    const editor = createFootnoteRuntimeEditor({
      value: [
        {
          children: [{ children: [{ text: 'one' }], type: 'p' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'duplicate' }], type: 'p' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const normalizedIdentifier =
      editor.update.footnote.normalizeDuplicateDefinition({ path: [1] });

    expect(String(normalizedIdentifier)).toBe('2');

    const { footnote } = editor.api;

    expect(footnote.hasDuplicateDefinitions({ identifier: '1' })).toBe(false);
    expect(footnote.definition({ identifier: '2' })?.[1]).toEqual([1]);
  });

  it('renumbers a definition inserted earlier in the same transaction', () => {
    const editor = createFootnoteRuntimeEditor({
      value: [
        {
          children: [{ children: [{ text: 'one' }], type: 'p' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.insert(
        {
          children: [{ children: [{ text: 'duplicate' }], type: 'p' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        { at: [1] }
      );
      tx.footnote.normalizeDuplicateDefinition({ path: [1] });
    });

    expect(editor.read.nodes.get([1])?.[0]).toMatchObject({ identifier: '2' });
  });

  it('inserts a footnote reference and definition through the runtime transaction group', () => {
    const editor = createFootnoteRuntimeEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hi' }], type: 'p' }],
    });

    editor.update.insert.footnote({ focusDefinition: false });

    expect(editor.read.value().children).toEqual([
      {
        children: [
          { text: 'hi' },
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnoteReference',
          },
          { text: '' },
        ],
        type: 'p',
      },
      {
        children: [{ children: [{ text: '' }], type: 'p' }],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('navigates between definitions and references through runtime transaction groups', () => {
    const editor = createFootnoteRuntimeEditor({
      value: [
        {
          children: [
            { text: 'a' },
            {
              children: [{ text: '' }],
              identifier: '1',
              type: 'footnoteReference',
            },
            { text: 'b' },
          ],
          type: 'p',
        },
        {
          children: [{ children: [{ text: 'body' }], type: 'p' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const didFocusDefinition = editor.update.footnote.focusDefinition({
      identifier: '1',
    });

    expect(didFocusDefinition).toBe(true);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });

    const didFocusReference = editor.update.footnote.focusReference({
      identifier: '1',
    });

    expect(didFocusReference).toBe(true);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });
});
