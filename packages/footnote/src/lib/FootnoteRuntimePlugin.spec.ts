import type { Value } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteReferencePlugin,
} from './index';
import type { FootnoteConfig } from './BaseFootnoteReferencePlugin';

const createFootnoteRuntimeEditor = ({
  selection,
  value,
}: {
  selection?: {
    anchor: { offset: number; path: number[] };
    focus: { offset: number; path: number[] };
  };
  value: Value;
}) =>
  createPlateEditor<
    Value,
    typeof BaseFootnoteReferencePlugin | typeof BaseFootnoteDefinitionPlugin
  >({
    plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
    selection,
    value,
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
    const api = (editor.api as FootnoteConfig['api']).footnote;

    expect(api.definition({ identifier: '1' })?.[1]).toEqual([1]);
    expect(api.definitions({ identifier: '1' })).toHaveLength(2);
    expect(api.references({ identifier: '1' })).toHaveLength(1);
    expect(api.definitionText({ identifier: '1' })).toBe('body');
    expect(api.isResolved({ identifier: '1' })).toBe(true);
    expect(api.hasDuplicateDefinitions({ identifier: '1' })).toBe(true);
    expect(api.duplicateDefinitions({ identifier: '1' })).toHaveLength(1);
    expect(api.duplicateIdentifiers()).toEqual(['1']);
    expect(api.identifiers()).toEqual(['1']);
    expect(api.nextId()).toBe('2');
    const editorApi = editor.api as unknown as FootnoteConfig['api'];

    expect(editorApi.footnote.definition({ identifier: '1' })?.[1]).toEqual([
      1,
    ]);
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
    let normalizedIdentifier: false | string = false;

    editor.update((tx) => {
      normalizedIdentifier = tx.footnote.normalizeDuplicateDefinition({
        path: [1],
      });
    });

    expect(String(normalizedIdentifier)).toBe('2');

    const api = (editor.api as FootnoteConfig['api']).footnote;

    expect(api.hasDuplicateDefinitions({ identifier: '1' })).toBe(false);
    expect(api.definition({ identifier: '2' })?.[1]).toEqual([1]);
  });

  it('inserts a footnote reference and definition through the runtime transaction group', () => {
    const editor = createFootnoteRuntimeEditor({
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hi' }], type: 'p' }],
    });

    editor.update((tx) => tx.insert.footnote({ focusDefinition: false }));

    expect(editor.read((state) => state.value.root())).toEqual([
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
    expect(editor.read((state) => state.selection.get())).toEqual({
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
    let didFocusDefinition = false;
    let didFocusReference = false;

    editor.update((tx) => {
      didFocusDefinition = tx.footnote.focusDefinition({ identifier: '1' });
    });

    expect(didFocusDefinition).toBe(true);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });

    editor.update((tx) => {
      didFocusReference = tx.footnote.focusReference({ identifier: '1' });
    });

    expect(didFocusReference).toBe(true);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('marks the reference plugin for runtime combobox support', () => {
    expect(BaseFootnoteReferencePlugin.runtimeTriggerCombobox).toBe(true);
  });
});
