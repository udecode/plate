import React from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { Plate } from '@udecode/plate-common';

import { Editor } from '@/registry/default/plate-ui/editor';

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
      <Editor {...editableProps} />
    </Plate>
  );
}
