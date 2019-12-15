import React, { useState } from 'react';
import { useCreateEditor } from 'slate-plugins';
import { Editable, Slate, withReact } from 'slate-react';
import { initialValueReadOnly } from './config/initialValues';

export const ReadOnly = () => {
  const [value, setValue] = useState(initialValueReadOnly);

  const editor = useCreateEditor([withReact]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Editable readOnly placeholder="Enter some plain text..." />
    </Slate>
  );
};
