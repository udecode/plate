import React from 'react';
import { Plate } from '@udecode/plate';

export default function BasicEditorDefaultApp() {
  return (
    <Plate
      editableProps={{
        placeholder: 'Type...',
      }}
    />
  );
}
