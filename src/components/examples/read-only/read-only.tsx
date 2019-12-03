import React, { useMemo } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { initialValue } from './config';

export const ReadOnly = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable readOnly placeholder="Enter some plain text..." />
    </Slate>
  );
};
