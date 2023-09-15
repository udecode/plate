import React, { useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { Plate, PlateContent, Value } from '@udecode/plate-common';

export default function BasicEditorHandlerDemo() {
  const [debugValue, setDebugValue] = useState<Value>([]);

  return (
    <Plate
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
      <PlateContent {...editableProps} />
      debug value:
      <br />
      {JSON.stringify(debugValue)}
    </Plate>
  );
}
