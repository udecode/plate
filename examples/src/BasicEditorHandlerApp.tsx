import React, { useState } from 'react';
import { Plate } from '@udecode/plate';
import { plainTextValue } from './basic-editor/index';
import { editableProps } from './common/index';

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
