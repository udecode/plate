import { createBaseEditor } from '@platejs/core';
import { DocumentChange } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteReferencePlugin,
} from '../index';
describe('footnote registry', () => {
  it('stays current across text edits and footnote insertion', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [1, 0, 0] },
        focus: { offset: 4, path: [1, 0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: '1' }],
              identifier: '1',
              type: 'footnoteReference',
            },
            { text: '' },
          ],
          type: KEYS.p,
        },
        {
          children: [{ children: [{ text: 'body' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const { footnote } = editor.api;

    expect(footnote.definition({ identifier: '1' })).toBeDefined();
    expect(footnote.definitions({ identifier: '1' })).toHaveLength(1);
    expect(footnote.isResolved({ identifier: '1' })).toBe(true);
    expect(footnote.hasDuplicateDefinitions({ identifier: '1' })).toBe(false);
    expect(footnote.duplicateIdentifiers()).toEqual([]);
    expect(footnote.references({ identifier: '1' })).toHaveLength(1);
    expect(footnote.definitionText({ identifier: '1' })).toBe('body');
    expect(footnote.nextId()).toBe('2');

    editor.update.text.insert('!');

    expect(footnote.definitionText({ identifier: '1' })).toBe('body!');

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
    editor.update.insert.footnote({
      focusDefinition: false,
      identifier: '2',
    });

    expect(footnote.nextId()).toBe('3');
  });

  it('detects duplicate definitions without scanning on every lookup', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      initialValue: [
        {
          children: [{ children: [{ text: 'one' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'duplicate' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const { footnote } = editor.api;

    expect(footnote.isResolved({ identifier: '1' })).toBe(true);
    expect(footnote.hasDuplicateDefinitions({ identifier: '1' })).toBe(true);
    expect(footnote.duplicateIdentifiers()).toEqual(['1']);
    expect(footnote.definitions({ identifier: '1' })).toHaveLength(2);
    expect(footnote.duplicateDefinitions({ identifier: '1' })).toHaveLength(1);
    expect(footnote.isDuplicateDefinition({ path: [0] })).toBe(false);
    expect(footnote.isDuplicateDefinition({ path: [1] })).toBe(true);
  });

  it('invalidates for footnotes nested in inserted and removed blocks', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    expect(editor.api.footnote.nextId()).toBe('1');

    editor.update.nodes.insert(
      {
        children: [
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnoteReference',
          },
        ],
        type: KEYS.p,
      },
      { at: [1] }
    );

    expect(editor.api.footnote.nextId()).toBe('2');

    editor.update.nodes.remove({ at: [1] });

    expect(editor.api.footnote.nextId()).toBe('1');
  });

  it('can renumber a later duplicate definition without touching the canonical first definition', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      initialValue: [
        {
          children: [{ children: [{ text: 'one' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'duplicate' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const { footnote } = editor.api;

    expect(
      editor.update.footnote.normalizeDuplicateDefinition({ path: [1] })
    ).toBe('2');
    expect(footnote.hasDuplicateDefinitions({ identifier: '1' })).toBe(false);
    expect(footnote.duplicateIdentifiers()).toEqual([]);
    expect(footnote.definition({ identifier: '1' })).toMatchObject([
      { identifier: '1', type: 'footnoteDefinition' },
      [0],
    ]);
    expect(footnote.definition({ identifier: '2' })).toMatchObject([
      { identifier: '2', type: 'footnoteDefinition' },
      [1],
    ]);
    expect(footnote.isDuplicateDefinition({ path: [1] })).toBe(false);
  });

  it('invalidates for a classification-free identifier change', () => {
    const value = [
      {
        children: [{ children: [{ text: 'one' }], type: KEYS.p }],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ];
    const plugins = [
      BaseFootnoteReferencePlugin,
      BaseFootnoteDefinitionPlugin,
    ] as const;
    const source = createBaseEditor({
      plugins,
      initialValue: value,
    });

    source.update.nodes.set({ identifier: '2' }, { at: [0] });

    const change = DocumentChange.fromJSON(
      source.read.lastCommit()!.changes.toJSON()
    );
    const replay = createBaseEditor({
      plugins,
      initialValue: value,
    });

    expect(replay.api.footnote.definition({ identifier: '1' })).toBeDefined();
    expect(change.primaryClassification).toBeNull();
    replay.update((tx) => tx.changes.apply(change));

    expect(replay.api.footnote.definition({ identifier: '1' })).toBeUndefined();
    expect(replay.api.footnote.definition({ identifier: '2' })).toBeDefined();
  });
});
