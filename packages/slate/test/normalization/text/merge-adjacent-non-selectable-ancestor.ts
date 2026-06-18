import { createEditor } from '@platejs/slate';
import { Editor, getEditorRuntime } from '@platejs/slate/internal';

export const input = createEditor() as any;
const runtime = getEditorRuntime(input);

const { shouldNormalize } = runtime;
const isSelectable = runtime.schema.isSelectable;

runtime.schema = {
  ...runtime.schema,
  isSelectable: (element: any) =>
    element.type === 'collapsible-content' ? false : isSelectable(element),
};

runtime.shouldNormalize = (options: any) => {
  if (options.iteration > 20) {
    throw new Error(
      'Normalization likely stalled while merging text under a non-selectable element.'
    );
  }

  return shouldNormalize(options);
};

Editor.replace(input, {
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
});

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
