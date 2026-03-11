/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('getMarks', () => {
  it('returns marks at a collapsed text selection', () => {
    const editor = createEditor({
      children: [
        {
          children: [{ text: 'plain' }, { bold: true, text: 'text' }],
          type: 'p',
        },
      ] as any,
      selection: {
        anchor: { offset: 2, path: [0, 1] },
        focus: { offset: 2, path: [0, 1] },
      },
    });

    expect(editor.api.marks()).toEqual({ bold: true });
  });

  it('returns the common marks across an expanded selection', () => {
    const editor = createEditor({
      children: [
        {
          children: [
            { text: 'plain' },
            { bold: true, text: 'bold' },
            { bold: true, italic: true, text: 'mixed' },
          ],
          type: 'p',
        },
      ] as any,
      selection: {
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 5, path: [0, 2] },
      },
    });

    expect(editor.api.marks()).toEqual({ bold: true });
  });

  it('returns marks from a collapsed markable void', () => {
    const editor = createEditor({
      children: [
        {
          children: [
            { text: 'word' },
            {
              children: [{ bold: true, text: '' }],
              markable: true,
              type: 'tag',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ] as any,
      selection: {
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 0, path: [0, 1, 0] },
      },
    }) as any;

    editor.isVoid = (element: any) => element.type === 'tag';
    editor.markableVoid = (element: any) =>
      element.type === 'tag' && element.markable;

    expect(editor.api.marks()).toEqual({ bold: true });
  });
});
