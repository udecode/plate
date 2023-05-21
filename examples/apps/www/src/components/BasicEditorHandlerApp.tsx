import React, { useState } from 'react';
import { Plate } from '@udecode/plate';

import { plainTextValue } from '@/plate/basic-editor/plainTextValue';
import { editableProps } from '@/plate/common/editableProps';
import { MyValue } from '@/plate/typescript/plateTypes';

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
