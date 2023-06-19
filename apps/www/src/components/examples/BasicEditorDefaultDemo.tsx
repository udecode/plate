import React from 'react';
import { Plate } from '@udecode/plate-common';

export default function BasicEditorDefaultDemo() {
  return (
    // eslint-disable-next-line react/jsx-no-undef
    <Plate
      editableProps={{
        placeholder: 'Type...',
      }}
    />
  );
}
