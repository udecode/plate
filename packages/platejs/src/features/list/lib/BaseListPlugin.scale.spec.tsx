import { BaseParagraphPlugin, createEditor, NodeApi } from '../../../core';
import { BaseListPlugin } from './BaseListPlugin';

describe('BaseListPlugin scale and list families', () => {
  it('does not write derived ordinals across a large numbered list', () => {
    const editor = createEditor({
      plugins: [BaseListPlugin],
      initialValue: Array.from({ length: 500 }, (_, index) => ({
        children: [{ text: `Item ${index + 1}` }],
        indent: 1,
        ...(index === 0 ? { listStart: 8 } : {}),
        listType: 'numbered' as const,
        type: 'paragraph',
      })),
    });

    editor.update.text.insert('!', {
      at: { offset: 6, path: [250, 0] },
    });

    expect(
      editor.read.children().filter((node) => 'listStart' in node)
    ).toHaveLength(1);
  });

  it.each([
    ['an explicit indent', 1],
    ['an omitted indent', undefined],
  ])('moves a parent with %s together with its deeper child', (_, indent) => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseListPlugin],
      initialValue: [
        {
          children: [{ text: 'Parent' }],
          ...(indent === undefined ? {} : { indent }),
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Child' }],
          indent: 2,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Sibling' }],
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        kind: 'text',
      },
    });

    editor.api.transfer.move({ to: 'next' });

    expect(editor.read.children().map((node) => NodeApi.string(node))).toEqual([
      'Sibling',
      'Parent',
      'Child',
    ]);
  });
});
