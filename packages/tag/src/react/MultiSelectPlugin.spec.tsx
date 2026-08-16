import { createPlateEditor } from '@platejs/core/react';
import { TextApi } from '@platejs/plite';

import { MultiSelectPlugin } from './MultiSelectPlugin';

describe('MultiSelectPlugin', () => {
  it('inserts a tag while search text is present', () => {
    const editor = createPlateEditor({
      plugins: [MultiSelectPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 1] },
        focus: { offset: 3, path: [0, 1] },
      },
      initialValue: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: 'tag',
              value: 'Editor',
            },
            { text: 'sel' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const { type } = editor.plugin(MultiSelectPlugin).schema;

    editor.plugin(MultiSelectPlugin).update.insert({ value: 'Select Editor' });
    expect(
      Array.from(
        editor.read.nodes.entries({
          at: [],
          type,
        })
      ).map(([node]) => node.value)
    ).toEqual(['Editor', 'Select Editor']);
  });

  it('deletes the previous tag before moving past the remaining tag', () => {
    const editor = createPlateEditor({
      plugins: [MultiSelectPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 3] },
        focus: { offset: 0, path: [0, 3] },
      },
      initialValue: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: 'tag',
              value: 'alpha',
            },
            { text: '' },
            {
              children: [{ text: '' }],
              type: 'tag',
              value: 'beta',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const { type } = editor.plugin(MultiSelectPlugin).schema;

    editor.update.text.deleteBackward({ unit: 'character' });
    expect(
      Array.from(
        editor.read.nodes.entries({
          at: [],
          type,
        })
      ).map(([node]) => node.value)
    ).toEqual(['alpha']);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('routes duplicate tag cleanup through the Plite runtime', () => {
    const editor = createPlateEditor({
      plugins: [MultiSelectPlugin],
      initialValue: [
        {
          children: [
            { text: 'query' },
            { children: [{ text: '' }], type: 'tag', value: 'alpha' },
            { text: '' },
            { children: [{ text: '' }], type: 'tag', value: 'alpha' },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const { type } = editor.plugin(MultiSelectPlugin).schema;

    editor.update.value.repair();

    const children = editor.read.children()[0].children;
    const tags = Array.from(
      editor.read.nodes.entries({
        at: [],
        type,
      })
    ).map(([node]) => node);
    const nonEmptyTexts = children.filter(
      (node) => TextApi.isText(node) && node.text.length > 0
    );

    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({ type: 'tag', value: 'alpha' });
    expect(nonEmptyTexts).toEqual([]);
  });

  it('keeps selected Plite search text and trims leading whitespace', () => {
    const editor = createPlateEditor({
      plugins: [MultiSelectPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 7, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: '  query' }],
          type: 'paragraph',
        },
        {
          children: [{ text: ' stale' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update((tx) => {
      const at = tx.points.end([0, 0]);

      if (at) tx.text.insert('!', { at });
    });
    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'query!' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });
});
