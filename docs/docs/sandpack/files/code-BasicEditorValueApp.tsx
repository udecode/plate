export const basicEditorValueAppCode = `import React from 'react';
import { Plate } from '@udecode/plate';
import { editableProps } from './common/editableProps';
import { MyParagraphElement, MyValue } from './typescript/plateTypes';

const initialValue = [
  {
    type: 'p',
    children: [
      {
        text:
          'This is editable plain text with react and history plugins, just like a <textarea>!',
      },
    ],
  } as MyParagraphElement,
];

export default () => (
  <Plate<MyValue> editableProps={editableProps} initialValue={initialValue} />
);
`;

export const basicEditorValueAppFile = {
  '/BasicEditorValueApp.tsx': basicEditorValueAppCode,
};
