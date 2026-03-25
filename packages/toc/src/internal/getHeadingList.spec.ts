import { createSlateEditor } from 'platejs';

import { BaseTocPlugin } from '../lib/BaseTocPlugin';
import { getHeadingList } from './getHeadingList';

describe('getHeadingList', () => {
  it('returns titled headings with depth, path, and id', () => {
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin],
      value: [
        {
          children: [{ text: 'Title' }],
          id: 'a',
          type: 'h1',
        },
        {
          children: [{ text: '' }],
          id: 'skip-empty',
          type: 'h2',
        },
        {
          children: [{ text: 'Body' }],
          id: 'skip-paragraph',
          type: 'p',
        },
        {
          children: [{ text: 'Section' }],
          id: 'b',
          type: 'h3',
        },
      ],
    });

    expect(getHeadingList(editor)).toEqual([
      {
        depth: 1,
        id: 'a',
        path: [0],
        title: 'Title',
        type: 'h1',
      },
      {
        depth: 3,
        id: 'b',
        path: [3],
        title: 'Section',
        type: 'h3',
      },
    ]);
  });

  it('uses the configured queryHeading override when present', () => {
    const queryHeading = mock(
      () =>
        [
          {
            depth: 9,
            id: 'custom',
            path: [42],
            title: 'Custom',
            type: 'custom-heading',
          },
        ] as any
    ) as any;
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin.configure({ options: { queryHeading } })],
      value: [
        {
          children: [{ text: 'Ignored' }],
          id: 'a',
          type: 'h1',
        },
      ],
    });

    expect(getHeadingList(editor)).toEqual([
      {
        depth: 9,
        id: 'custom',
        path: [42],
        title: 'Custom',
        type: 'custom-heading',
      },
    ]);
    expect(queryHeading).toHaveBeenCalledWith(editor);
  });
});
