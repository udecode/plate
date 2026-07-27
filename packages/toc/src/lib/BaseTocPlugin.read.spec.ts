import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { schema } from '@platejs/plite';

import { BaseTocPlugin } from './BaseTocPlugin';

const TestHeadingPlugins = [
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
];

describe('BaseTocPlugin.read.headings', () => {
  it('returns titled headings with depth, path, and id', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin, ...TestHeadingPlugins],
      initialValue: [
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

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([
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
    const queryHeading = mock(() => [
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
        BaseTocPlugin.configure({ initialState: { queryHeading } }),
        ...TestHeadingPlugins,
      ],
      initialValue: [
        {
          children: [{ text: 'Ignored' }],
          id: 'a',
          type: 'h1',
        },
      ],
    });

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([
      {
        depth: 9,
        id: 'custom',
        path: [42],
        title: 'Custom',
        type: 'custom-heading',
      },
    ]);
    expect(queryHeading).toHaveBeenCalledWith(
      expect.objectContaining({ nodes: expect.any(Object) })
    );
  });
});
