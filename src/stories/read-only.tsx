import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { initialValueReadOnly } from './config/initialValues';

export const ReadOnly = () => {
  const [value, setValue] = useState(initialValueReadOnly);
  const editor = useMemo(() => withReact(createEditor()), []);

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
