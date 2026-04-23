import { KEYS, createSlateEditor } from 'platejs';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteReferencePlugin,
} from '../index';
import { createFootnoteDefinition } from './createFootnoteDefinition';

describe('createFootnoteDefinition', () => {
  it('creates a missing definition at the end of the document and focuses it', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      selection: {
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'hello' }],
          type: KEYS.p,
        },
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
      ],
    } as any);

    expect(createFootnoteDefinition(editor, { identifier: '1' })).toEqual([2]);
    expect(editor.children[2]).toMatchObject({
      children: [{ children: [{ text: '' }], type: KEYS.p }],
      identifier: '1',
      type: 'footnoteDefinition',
    });
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [2, 0, 0] },
      focus: { offset: 0, path: [2, 0, 0] },
    });
  });

  it('focuses the existing definition instead of creating a duplicate', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      value: [
        {
          children: [{ text: 'hello' }],
          type: KEYS.p,
        },
        {
          children: [{ children: [{ text: 'body' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    } as any);

    expect(createFootnoteDefinition(editor, { identifier: '1' })).toEqual([1]);
    expect(editor.children).toHaveLength(2);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('can create a definition without moving the selection', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      selection: {
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'hello' }],
          type: KEYS.p,
        },
      ],
    } as any);

    expect(
      createFootnoteDefinition(editor, {
        focus: false,
        identifier: '2',
      })
    ).toEqual([1]);
    expect(editor.children[1]).toMatchObject({
      children: [{ children: [{ text: '' }], type: KEYS.p }],
      identifier: '2',
      type: 'footnoteDefinition',
    });
    expect(editor.selection).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
  });
});
