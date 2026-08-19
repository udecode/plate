'use client';

import { Plate, usePlateEditor } from 'platejs/react';

import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';

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
    level: 1,
    type: 'heading',
  },
  {
    children: [{ text: 'Heading 2' }],
    level: 2,
    type: 'heading',
  },
  {
    children: [{ text: 'Heading 3' }],
    level: 3,
    type: 'heading',
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
