import React, { useState } from 'react';
import { Plate } from '@udecode/plate';
import { plainTextValue } from './basic-editor/plainTextValue';
import { editableProps } from './common/editableProps';
import { MyValue } from './typescript/plateTypes';

export default function BasicEditorHandlerApp() {
  const [debugValue, setDebugValue] = useState<MyValue | null>(null);

  return (
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={plainTextValue}
      onChange={(newValue) => {
        setDebugValue(newValue);
        // save newValue...
      }}
    >
      value: {JSON.stringify(debugValue)}
    </Plate>
  );
}
