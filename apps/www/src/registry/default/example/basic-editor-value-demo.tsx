import React from 'react';
import { Plate } from '@udecode/plate-common';

import { editableProps } from '@/plate/demo/editableProps';
import { MyParagraphElement, MyValue } from '@/types/plate-types';

const initialValue = [
  {
    type: 'p',
    children: [
      {
        text: 'This is editable plain text with react and history plugins, just like a <textarea>!',
      },
    ],
  } as MyParagraphElement,
];

export default function BasicEditorValueDemo() {
  return (
    <Plate<MyValue> editableProps={editableProps} initialValue={initialValue} />
  );
}
