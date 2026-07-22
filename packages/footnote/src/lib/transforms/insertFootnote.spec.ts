import { createPlateEditor } from '@platejs/core/react';
import { defineEditorExtension } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteReferencePlugin,
} from '../index';
describe('insertFootnote', () => {
  it('inserts a reference, creates a definition, and focuses the definition body', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'hello' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.insert.footnote();

    expect(editor.read.value().children).toMatchObject([
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
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('uses the selected content as the initial definition body', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'hello world' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.insert.footnote();

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: 'hello ' },
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
        children: [
          {
            children: [{ text: 'world' }],
            type: KEYS.p,
          },
        ],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ]);
  });

  it('inserts at an explicit target without an active selection', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      value: [
        {
          children: [{ text: 'hello' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.insert.footnote({
      at: [0, 0],
      focusDefinition: false,
    });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnoteReference',
          },
          { text: 'hello' },
        ],
        type: KEYS.p,
      },
      {
        children: [{ children: [{ text: '' }], type: KEYS.p }],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ]);
  });

  it('skips used numeric identifiers and avoids duplicate definitions', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      selection: {
        kind: 'text',
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
    });

    editor.update.insert.footnote();

    expect(editor.read.value().children[0]).toMatchObject({
      children: expect.arrayContaining([
        { text: 'x' },
        {
          children: [{ text: '' }],
          identifier: '2',
          type: 'footnoteReference',
        },
      ]),
    });
    expect(editor.read.value().children).toHaveLength(5);
    expect(editor.read.nodes.get([4])?.[0]).toMatchObject({
      identifier: '2',
      type: 'footnoteDefinition',
    });
  });

  it('focuses an existing definition instead of creating a duplicate when identifier is provided', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      selection: {
        kind: 'text',
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
    });

    editor.update.insert.footnote({ identifier: '7' });

    expect(editor.read.value().children).toMatchObject([
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
    expect(editor.read.value().children).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('can keep the caret inline after inserting a new footnote', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'x' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.insert.footnote({ focusDefinition: false });

    expect(editor.read.value().children).toMatchObject([
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
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('bound insert.footnote respects configured node types', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseFootnoteReferencePlugin.configure({
          type: 'custom-footnote-reference',
        }),
        BaseFootnoteDefinitionPlugin.configure({
          type: 'custom-footnote-definition',
        }),
      ] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'x' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.insert.footnote();

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'custom-footnote-reference',
          },
          { text: '' },
        ],
        type: KEYS.p,
      },
      {
        children: [{ children: [{ text: '' }], type: KEYS.p }],
        identifier: '1',
        type: 'custom-footnote-definition',
      },
    ]);
  });

  it('provides focus helpers for definitions and references', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
      value: [
        {
          children: [
            { text: 'a' },
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
          children: [{ children: [{ text: 'body' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const scrollIntoView = mock();
    editor.extend(
      defineEditorExtension({
        api: { dom: { scrollIntoView } },
        name: 'test:scroll-service',
      })
    );

    expect(editor.update.footnote.focusDefinition({ identifier: '1' })).toBe(
      true
    );
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
    expect(editor.api.navigation.activeTarget()).toMatchObject({
      path: [1],
      type: 'node',
      variant: 'navigated',
    });
    expect(scrollIntoView).toHaveBeenCalledWith({
      offset: 0,
      path: [1, 0, 0],
    });

    expect(editor.update.footnote.focusReference({ identifier: '1' })).toBe(
      true
    );
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
    expect(editor.api.navigation.activeTarget()).toMatchObject({
      path: [0, 1],
      type: 'node',
      variant: 'navigated',
    });
    expect(scrollIntoView).toHaveBeenLastCalledWith({
      offset: 0,
      path: [0, 2],
    });
  });

  it('focuses the next sibling text when a reference has visible trailing text', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseFootnoteReferencePlugin,
        BaseFootnoteDefinitionPlugin,
      ] as const,
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
    });
    const scrollIntoView = mock();
    editor.extend(
      defineEditorExtension({
        api: { dom: { scrollIntoView } },
        name: 'test:scroll-service',
      })
    );

    expect(editor.update.footnote.focusReference({ identifier: '1' })).toBe(
      true
    );
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
    expect(editor.api.navigation.activeTarget()).toMatchObject({
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
