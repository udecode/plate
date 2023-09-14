import React, { useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { Plate, Value } from '@udecode/plate-common';

export default function BasicEditorHandlerDemo() {
  const [debugValue, setDebugValue] = useState<Value>([]);

  return (
    <Plate
      editableProps={editableProps}
      initialValue={[
        {
          type: 'p',
          children: [
            {
              text: 'This is editable plain text with react and history plugins, just like a textarea!',
            },
          ],
        },
      ]}
      onChange={(newValue) => {
        setDebugValue(newValue);
        // save newValue...
      }}
    >
      debug value:
      <br />
      {JSON.stringify(debugValue)}
    </Plate>
  );
}
