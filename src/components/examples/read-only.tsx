import React, { useMemo, useState } from 'react';
import { createEditor, Range } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { initialValueReadOnly } from '../../config/initialValues';

export const ReadOnly = () => {
  const [value, setValue] = useState(initialValueReadOnly);
  const [selection, setSelection] = useState<Range | null>(null);
  const editor = useMemo(() => withReact(createEditor()), []);

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
      <Editable readOnly placeholder="Enter some plain text..." />
    </Slate>
  );
};
