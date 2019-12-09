import React, { useMemo, useState } from 'react';
import { createEditor, Range } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { initialValue } from './read-only.config';

export const ReadOnly = () => {
  const [value, setValue] = useState(initialValue);
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
