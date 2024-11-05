'use client';

import React from 'react';

import {
  type PlateContentProps,
  Plate,
  usePlateEditor,
} from '@udecode/plate-common/react';

import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

const editableProps: PlateContentProps = {
  autoFocus: false,
  placeholder: 'Type…',
  spellCheck: false,
};

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
        <Editor {...editableProps} />
      </EditorContainer>
    </Plate>
  );
}
