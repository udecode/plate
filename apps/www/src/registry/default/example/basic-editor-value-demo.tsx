import React from 'react';

import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import { editableProps } from '@/plate/demo/editableProps';
import { Editor } from '@/registry/default/plate-ui/editor';

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
      <Editor {...editableProps} />
    </Plate>
  );
}
