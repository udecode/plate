'use client';

import React from 'react';

import { Plate, usePlateEditor } from '@udecode/plate/react';

import { Editor, EditorContainer } from '@/registry/ui/editor';

const value = [
  {
    children: [
      {
        text: 'This is editable plain text with react and history plugins, just like a <textarea>!',
      },
    ],
    type: 'p',
  },
];

export default function BasicEditorValueDemo() {
  const editor = usePlateEditor({ value });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
