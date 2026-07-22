import {
  type BaseEditor,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { schema } from '@platejs/plite';

import { BaseTocPlugin } from '../lib/BaseTocPlugin';
import { getHeadingList } from './getHeadingList';

const TestHeadingsPlugin = createBasePlugin({
  key: 'testHeadings',
  plugins: [
    createBasePlugin({
      key: 'h1',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }),
    createBasePlugin({
      key: 'h2',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }),
    createBasePlugin({
      key: 'h3',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }),
  ],
});

describe('getHeadingList', () => {
  it('returns titled headings with depth, path, and id', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin, TestHeadingsPlugin],
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
    const queryHeading = mock((_editor: BaseEditor) => [
      {
        depth: 9,
        id: 'custom',
        path: [42],
        title: 'Custom',
        type: 'custom-heading',
      },
    ]);
    const editor = createBaseEditor({
      plugins: [
        BaseTocPlugin.configure({ options: { queryHeading } }),
        TestHeadingsPlugin,
      ],
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
