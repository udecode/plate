import React from 'react';
import { Plate } from '@udecode/plate';
import { editableProps } from './common/editableProps';

const initialValue = [
  {
    type: 'p',
    children: [
      {
        text:
          'This is editable plain text with react and history plugins, just like a <textarea>!',
      },
    ],
  },
];

export default () => (
  <Plate editableProps={editableProps} initialValue={initialValue} />
);
