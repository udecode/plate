import React from 'react';

import { Plate } from '@udecode/plate-common';

import { editableProps } from '@/plate/demo/editableProps';
import { Editor } from '@/registry/default/plate-ui/editor';

const initialValue = [
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
  return (
    <Plate initialValue={initialValue}>
      <Editor {...editableProps} />
    </Plate>
  );
}
