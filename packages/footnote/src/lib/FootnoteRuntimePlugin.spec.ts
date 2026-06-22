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
    runtime: 'slate-v2',
    selection,
    value,
  });

describe('BaseFootnoteReferencePlugin Slate v2 runtime', () => {
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
    const api = editor.getPluginApi<FootnoteConfig['api']>(
      BaseFootnoteReferencePlugin
    ).footnote;

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

  it('renumbers duplicate definitions through the runtime transform facade', () => {
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
    const transforms = editor.getTransforms<FootnoteConfig['transforms']>(
      BaseFootnoteReferencePlugin
    );

    expect(
      transforms.footnote.normalizeDuplicateDefinition({ path: [1] })
    ).toBe('2');

    const api = editor.getPluginApi<FootnoteConfig['api']>(
      BaseFootnoteReferencePlugin
    ).footnote;

    expect(api.hasDuplicateDefinitions({ identifier: '1' })).toBe(false);
    expect(api.definition({ identifier: '2' })?.[1]).toEqual([1]);
  });

  it('inserts a footnote reference and definition through the runtime facade', () => {
    const editor = createFootnoteRuntimeEditor({
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hi' }], type: 'p' }],
    });
    const transforms = editor.getTransforms<FootnoteConfig['transforms']>(
      BaseFootnoteReferencePlugin
    );

    transforms.insert.footnote({ focusDefinition: false });

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

  it('navigates between definitions and references through runtime transforms', () => {
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
    const transforms = editor.getTransforms<FootnoteConfig['transforms']>(
      BaseFootnoteReferencePlugin
    );

    expect(transforms.footnote.focusDefinition({ identifier: '1' })).toBe(true);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });

    expect(transforms.footnote.focusReference({ identifier: '1' })).toBe(true);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('inserts the footnote combobox input through the runtime override route', () => {
    const editor = createFootnoteRuntimeEditor({
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [{ children: [{ text: '[' }], type: 'p' }],
    });

    editor.tf.insertText('^');

    expect(editor.read((state) => state.value.root()[0])).toEqual({
      children: [
        { text: '[' },
        {
          children: [{ text: '' }],
          type: 'footnoteInput',
        },
        { text: '' },
      ],
      type: 'p',
    });
  });
});
