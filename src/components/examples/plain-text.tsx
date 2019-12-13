import React, { useMemo, useState } from 'react';
import { createEditor, Range } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';
import { initialValuePlainText } from 'config/initialValues';

export const PlainText = () => {
  const [value, setValue] = useState(initialValuePlainText);
  const [selection, setSelection] = useState<Range | null>(null);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(newValue, newSelection) => {
        setValue(newValue);
        setSelection(newSelection);
      }}
    >
      <Editable placeholder="Enter some plain text..." />
    </Slate>
  );
};
