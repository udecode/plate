'use client';

import React from 'react';

import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

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
