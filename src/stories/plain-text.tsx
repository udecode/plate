import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import { useCreateEditor } from 'slate-plugins';
import { Editable, Slate, withReact } from 'slate-react';
import { initialValuePlainText } from './config/initialValues';

export const PlainText = () => {
  const [value, setValue] = useState(initialValuePlainText);

  const editor = useCreateEditor([withReact, withHistory]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Editable placeholder="Enter some plain text..." />
    </Slate>
  );
};
