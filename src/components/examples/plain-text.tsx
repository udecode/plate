import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';
import { initialValuePlainText } from 'config/initialValues';

export const PlainText = () => {
  const [value, setValue] = useState(initialValuePlainText);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

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
