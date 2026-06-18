import { createEditor } from '@platejs/slate';

export const input = createEditor() as any;

export const run = (editor) => {
  editor.extend({
    name: 'non-selectable-ancestor-fixture',
    elements: [
      {
        type: 'collapsible-content',
        selectable: false,
      },
    ],
  });

  editor.value.replace({
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'Before the collapsible.' }],
      },
      {
        type: 'collapsible',
        children: [
          {
            type: 'collapsible-summary',
            children: [{ text: 'Summary' }],
          },
          {
            type: 'collapsible-content',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'is' }, { text: ' here' }],
              },
            ],
          },
        ],
      },
    ],
    selection: null,
    marks: null,
  });

  editor.nodes.merge({ at: [1, 1, 0, 1], voids: true });
};

export const output = {
  children: [
    {
      type: 'paragraph',
      children: [{ text: 'Before the collapsible.' }],
    },
    {
      type: 'collapsible',
      children: [
        {
          type: 'collapsible-summary',
          children: [{ text: 'Summary' }],
        },
        {
          type: 'collapsible-content',
          children: [
            {
              type: 'paragraph',
              children: [{ text: 'is here' }],
            },
          ],
        },
      ],
    },
  ],
  selection: null,
} as any;
