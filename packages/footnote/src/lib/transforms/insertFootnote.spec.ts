import { KEYS, createSlateEditor } from 'platejs';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteReferencePlugin,
} from '../index';
import { insertFootnote } from './insertFootnote';

describe('insertFootnote', () => {
  it('inserts a reference, creates a definition, and focuses the definition body', () => {
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

    insertFootnote(editor);

    expect(editor.children).toMatchObject([
      {
        children: expect.arrayContaining([
          { text: 'hello' },
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnoteReference',
          },
        ]),
        type: KEYS.p,
      },
      {
        children: [
          {
            children: [{ text: '' }],
            type: KEYS.p,
          },
        ],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('uses the selected content as the initial definition body', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      selection: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'hello world' }],
          type: KEYS.p,
        },
      ],
    } as any);

    insertFootnote(editor);

    expect(editor.children[0]).toMatchObject({
      type: KEYS.p,
    });
    expect((editor.children[0] as any).children[0]).toMatchObject({
      text: 'hello ',
    });
    expect((editor.children[0] as any).children[1]).toMatchObject({
      children: [{ text: '' }],
      identifier: '1',
      type: 'footnoteReference',
    });
    expect(editor.children[1]).toMatchObject({
      children: [
        {
          children: [{ text: 'world' }],
          type: KEYS.p,
        },
      ],
      identifier: '1',
      type: 'footnoteDefinition',
    });
  });

  it('skips used numeric identifiers and avoids duplicate definitions', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'x' }],
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
        {
          children: [{ children: [{ text: 'one' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'three' }], type: KEYS.p }],
          identifier: '3',
          type: 'footnoteDefinition',
        },
      ],
    } as any);

    insertFootnote(editor);

    expect(editor.children[0]).toMatchObject({
      children: expect.arrayContaining([
        { text: 'x' },
        {
          children: [{ text: '' }],
          identifier: '2',
          type: 'footnoteReference',
        },
      ]),
    });
    expect(editor.children).toHaveLength(5);
    expect(editor.children[4]).toMatchObject({
      identifier: '2',
      type: 'footnoteDefinition',
    });
  });

  it('focuses an existing definition instead of creating a duplicate when identifier is provided', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'x' }],
          type: KEYS.p,
        },
        {
          children: [{ children: [{ text: 'existing' }], type: KEYS.p }],
          identifier: '7',
          type: 'footnoteDefinition',
        },
      ],
    } as any);

    insertFootnote(editor, { identifier: '7' });

    expect(editor.children).toMatchObject([
      {
        children: expect.arrayContaining([
          { text: 'x' },
          {
            children: [{ text: '' }],
            identifier: '7',
            type: 'footnoteReference',
          },
        ]),
      },
      {
        children: [{ children: [{ text: 'existing' }], type: KEYS.p }],
        identifier: '7',
        type: 'footnoteDefinition',
      },
    ]);
    expect(editor.children).toHaveLength(2);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('can keep the caret inline after inserting a new footnote', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'x' }],
          type: KEYS.p,
        },
      ],
    } as any);

    insertFootnote(editor, { focusDefinition: false });

    expect(editor.children).toMatchObject([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnoteReference',
          },
          { text: '' },
        ],
        type: KEYS.p,
      },
      {
        children: [{ children: [{ text: '' }], type: KEYS.p }],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('bound insert.footnote respects configured node types', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseFootnoteReferencePlugin.configure({
          node: { type: 'custom-footnote-reference' },
        }),
        BaseFootnoteDefinitionPlugin.configure({
          node: { type: 'custom-footnote-definition' },
        }),
      ],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'x' }],
          type: KEYS.p,
        },
      ],
    } as any);

    (editor.tf as any).insert.footnote();

    expect((editor.children[0] as any).children[0]).toMatchObject({
      text: 'x',
    });
    expect((editor.children[0] as any).children[1]).toMatchObject({
      identifier: '1',
      type: 'custom-footnote-reference',
    });
    expect(editor.children[1]).toMatchObject({
      identifier: '1',
      type: 'custom-footnote-definition',
    });
  });

  it('provides focus helpers for definitions and references', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      value: [
        {
          children: [
            { text: 'a' },
            {
              children: [{ text: '' }],
              identifier: '1',
              type: 'footnoteReference',
            },
          ],
          type: KEYS.p,
        },
        {
          children: [{ children: [{ text: 'body' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    } as any);
    const scrollIntoView = mock();
    (editor.api as any).scrollIntoView = scrollIntoView;

    expect(
      (editor.tf as any).footnote.focusDefinition({ identifier: '1' })
    ).toBe(true);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
    expect((editor.api as any).navigation.activeTarget()).toMatchObject({
      path: [1],
      type: 'node',
      variant: 'navigated',
    });
    expect(scrollIntoView).toHaveBeenCalledWith({
      offset: 0,
      path: [1, 0, 0],
    });

    expect(
      (editor.tf as any).footnote.focusReference({ identifier: '1' })
    ).toBe(true);
    expect(editor.selection).toEqual({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    expect((editor.api as any).navigation.activeTarget()).toMatchObject({
      path: [0, 1],
      type: 'node',
      variant: 'navigated',
    });
    expect(scrollIntoView).toHaveBeenLastCalledWith({
      offset: 1,
      path: [0, 0],
    });
  });

  it('focuses the next sibling text when a reference has visible trailing text', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      value: [
        {
          children: [
            { text: 'a' },
            {
              children: [{ text: '' }],
              identifier: '1',
              type: 'footnoteReference',
            },
            { text: '.' },
          ],
          type: KEYS.p,
        },
      ],
    } as any);
    const scrollIntoView = mock();
    (editor.api as any).scrollIntoView = scrollIntoView;

    expect(
      (editor.tf as any).footnote.focusReference({ identifier: '1' })
    ).toBe(true);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
    expect((editor.api as any).navigation.activeTarget()).toMatchObject({
      path: [0, 1],
      type: 'node',
      variant: 'navigated',
    });
    expect(scrollIntoView).toHaveBeenCalledWith({
      offset: 0,
      path: [0, 2],
    });
  });
});
