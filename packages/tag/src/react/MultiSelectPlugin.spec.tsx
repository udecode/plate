import { NodeIdPlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { MultiSelectPlugin } from './MultiSelectPlugin';

describe('MultiSelectPlugin', () => {
  it('inserts a tag while search text is present', () => {
    const editor = createPlateEditor({
      plugins: [NodeIdPlugin, MultiSelectPlugin],
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
              type: KEYS.tag,
              value: 'Editor',
            },
            { text: 'sel' },
          ],
          type: 'p',
        },
      ],
    });

    editor.plugin(MultiSelectPlugin).update.insert({ value: 'Select Editor' });

    expect(
      editor.read
        .children()[0]
        .children.filter((node) => node.type === KEYS.tag)
        .map((node) => node.value)
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
              type: KEYS.tag,
              value: 'alpha',
            },
            { text: '' },
            {
              children: [{ text: '' }],
              type: KEYS.tag,
              value: 'beta',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(
      editor.read
        .children()[0]
        .children.filter((node) => node.type === KEYS.tag)
        .map((node) => node.value)
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
            { children: [{ text: '' }], type: KEYS.tag, value: 'alpha' },
            { text: '' },
            { children: [{ text: '' }], type: KEYS.tag, value: 'alpha' },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.value.repair();

    const children = editor.read.children()[0].children;
    const tags = children.filter((node) => node.type === KEYS.tag);
    const nonEmptyTexts = children.filter(
      (node) => typeof node.text === 'string' && node.text.length > 0
    );

    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({ type: KEYS.tag, value: 'alpha' });
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
          type: 'p',
        },
        {
          children: [{ text: ' stale' }],
          type: 'p',
        },
      ],
    });

    editor.update((tx) => {
      const at = tx.points.end([0, 0]);

      if (at) tx.text.insert('!', { at });
    });
    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'query!' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });
});
