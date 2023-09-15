import React from 'react';
import { editorProps } from '@/plate/demo/editorProps';
import { Editor, Plate } from '@udecode/plate-common';

const initialValue = [
  {
    type: 'p',
    children: [
      {
        text: 'This is editable plain text with react and history plugins, just like a <textarea>!',
      },
    ],
  },
];

export default function BasicEditorValueDemo() {
  return (
    <Plate initialValue={initialValue}>
      <Editor {...editorProps} />
    </Plate>
  );
}
