import { createPlateEditor, pipeOnChange } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { MultiSelectPlugin } from './TagPlugin';

describe('MultiSelectPlugin', () => {
  it('deletes the previous tag before moving past the remaining tag', () => {
    const editor = createPlateEditor({
      plugins: [MultiSelectPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 3] },
        focus: { offset: 0, path: [0, 3] },
      },
      value: [
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
      value: [
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
    pipeOnChange(editor, [...editor.read.children()]);

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
      value: [
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
    pipeOnChange(editor, [...editor.read.children()]);
    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'query!' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });
});
