export const basicEditorHandlerAppCode = `import React, { useState } from 'react';
import { Plate } from '@udecode/plate';
import { plainTextValue } from './basic-editor/index';
import { editableProps } from './common/editableProps';

export default () => {
  const [debugValue, setDebugValue] = useState(null);

  return (
    <Plate
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
};
`;

export const basicEditorHandlerAppFile = {
  '/BasicEditorHandlerApp.tsx': basicEditorHandlerAppCode,
};
