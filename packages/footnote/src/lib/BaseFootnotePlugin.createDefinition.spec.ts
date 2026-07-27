import { createBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseFootnoteDefinitionPlugin, BaseFootnotePlugin } from '../index';

const TestFootnoteBlockPlugin = createBasePlugin({
  key: 'testFootnoteBlock',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

describe('BaseFootnotePlugin createDefinition', () => {
  it('creates a missing definition at the end of the document and focuses it', () => {
    const editor = createPlateEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [
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
    });

    expect(
      editor.update.footnote.createDefinition({ identifier: '1' })
    ).toEqual([2]);
    expect(editor.read.nodes.get([2])?.[0]).toMatchObject({
      children: [{ children: [{ text: '' }], type: KEYS.p }],
      identifier: '1',
      type: 'footnoteDefinition',
    });
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [2, 0, 0] },
      focus: { offset: 0, path: [2, 0, 0] },
    });
  });

  it('focuses the existing definition instead of creating a duplicate', () => {
    const editor = createPlateEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      initialValue: [
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
    });

    expect(
      editor.update.footnote.createDefinition({ identifier: '1' })
    ).toEqual([1]);
    expect(editor.read.value().children).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('can create a definition without moving the selection', () => {
    const editor = createPlateEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'hello' }],
          type: KEYS.p,
        },
      ],
    });

    expect(
      editor.update.footnote.createDefinition({
        focus: false,
        identifier: '2',
      })
    ).toEqual([1]);
    expect(editor.read.nodes.get([1])?.[0]).toMatchObject({
      children: [{ children: [{ text: '' }], type: KEYS.p }],
      identifier: '2',
      type: 'footnoteDefinition',
    });
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
  });

  it('preserves block fragments as definition children', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseFootnotePlugin,
        BaseFootnoteDefinitionPlugin,
        TestFootnoteBlockPlugin,
      ] as const,
      initialValue: [
        {
          children: [{ text: 'hello' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.footnote.createDefinition({
      focus: false,
      fragment: [
        {
          children: [{ text: 'selected block' }],
          type: 'testFootnoteBlock',
        },
      ],
      identifier: '3',
    });

    expect(editor.read.nodes.get([1])?.[0]).toMatchObject({
      children: [
        {
          children: [{ text: 'selected block' }],
          type: 'testFootnoteBlock',
        },
      ],
      identifier: '3',
      type: 'footnoteDefinition',
    });
    expect(() =>
      editor.read.schema.validateDocument(editor.read.value())
    ).not.toThrow();
  });
});
