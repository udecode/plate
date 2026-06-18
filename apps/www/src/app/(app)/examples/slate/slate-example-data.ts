import type { Value } from '@platejs/slate';

export const slateExampleIds = [
  'plaintext',
  'richtext',
  'markdown-shortcuts',
  'history',
  'selection-navigation',
  'editable-voids',
  'custom-placeholder',
  'hidden-dom',
  'huge-document',
] as const;

export type SlateExampleId = (typeof slateExampleIds)[number];

export type SlateExample = {
  description: string;
  id: SlateExampleId;
  title: string;
  value: Value;
};

export const slateExamples: Record<SlateExampleId, SlateExample> = {
  'custom-placeholder': {
    description: 'Placeholder rendering shell for empty editor states.',
    id: 'custom-placeholder',
    title: 'Custom Placeholder',
    value: [{ type: 'paragraph', children: [{ text: '' }] }],
  },
  'editable-voids': {
    description: 'Editable void route shell for later behavior proof.',
    id: 'editable-voids',
    title: 'Editable Voids',
    value: [
      {
        type: 'paragraph',
        children: [{ text: 'Text before the editable void shell.' }],
      },
      {
        type: 'void-card',
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Text after the editable void shell.' }],
      },
    ],
  },
  'hidden-dom': {
    description: 'Hidden DOM coverage route shell for staged content checks.',
    id: 'hidden-dom',
    title: 'Hidden DOM',
    value: [
      {
        type: 'paragraph',
        children: [{ text: 'Visible content before hidden coverage.' }],
      },
      {
        type: 'hidden-section',
        children: [{ text: 'Hidden coverage shell content.' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Visible content after hidden coverage.' }],
      },
    ],
  },
  history: {
    description:
      'Undo and redo route shell using the default React history runtime.',
    id: 'history',
    title: 'History',
    value: [
      {
        type: 'paragraph',
        children: [{ text: 'Type here, then use undo and redo.' }],
      },
    ],
  },
  'huge-document': {
    description:
      'Large document route shell for later behavior and perf proof.',
    id: 'huge-document',
    title: 'Huge Document',
    value: Array.from({ length: 200 }, (_, index) => ({
      type: 'paragraph',
      children: [
        {
          text: `Paragraph ${index + 1}: a stable Slate route shell line for navigation and scrolling proof.`,
        },
      ],
    })),
  },
  'markdown-shortcuts': {
    description: 'Markdown shortcut route shell for input-rule proof.',
    id: 'markdown-shortcuts',
    title: 'Markdown Shortcuts',
    value: [
      {
        type: 'paragraph',
        children: [{ text: 'Try # heading, * list, or > quote patterns.' }],
      },
    ],
  },
  plaintext: {
    description: 'Plain text editing route shell.',
    id: 'plaintext',
    title: 'Plaintext',
    value: [
      {
        type: 'paragraph',
        children: [{ text: 'This is editable plain text.' }],
      },
    ],
  },
  richtext: {
    description: 'Rich text route shell with marks and block rendering.',
    id: 'richtext',
    title: 'Richtext',
    value: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is editable ' },
          { text: 'rich', bold: true },
          { text: ' text with ' },
          { text: 'marks', italic: true },
          { text: '.' },
        ],
      },
      {
        type: 'quote',
        children: [{ text: 'A block quote rendered by SlateElement.' }],
      },
    ],
  },
  'selection-navigation': {
    description: 'Selection and keyboard navigation route shell.',
    id: 'selection-navigation',
    title: 'Selection Navigation',
    value: [
      {
        type: 'paragraph',
        children: [{ text: 'First selectable line.' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Second selectable line.' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Third selectable line.' }],
      },
    ],
  },
};

export const slateExampleList = slateExampleIds.map((id) => slateExamples[id]);

export function getSlateExample(id: string): SlateExample | undefined {
  return slateExamples[id as SlateExampleId];
}
