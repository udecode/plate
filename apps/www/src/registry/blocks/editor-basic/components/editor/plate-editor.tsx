'use client';

import { Plate, usePlateEditor } from 'platejs/react';

import { BasicNodesKit } from '@/registry/components/editor/plugins/basic-nodes-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';

export function PlateEditor() {
  const editor = usePlateEditor({
    plugins: BasicNodesKit,
    initialValue: value,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor variant="demo" placeholder="Type..." />
      </EditorContainer>
    </Plate>
  );
}

const value = [
  {
    children: [{ text: 'Basic Editor' }],
    type: 'h1',
  },
  {
    children: [{ text: 'Heading 2' }],
    type: 'h2',
  },
  {
    children: [{ text: 'Heading 3' }],
    type: 'h3',
  },
  {
    children: [
      {
        children: [{ text: 'This blockquote contains more than one block.' }],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'It can also wrap nested quotes instead of flattening them.',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            children: [
              {
                text: 'Nested blockquotes keep the quote hierarchy intact.',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'blockquote',
      },
    ],
    type: 'blockquote',
  },
  {
    children: [
      { text: 'Basic marks: ' },
      { bold: true, text: 'bold' },
      { text: ', ' },
      { italic: true, text: 'italic' },
      { text: ', ' },
      { text: 'underline', underline: true },
      { text: ', ' },
      { strikethrough: true, text: 'strikethrough' },
      { text: '.' },
    ],
    type: 'paragraph',
  },
];
