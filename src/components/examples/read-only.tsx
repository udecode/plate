import React, { useMemo } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';

const initialValue = [
  {
    children: [
      {
        text: 'This is editable plain text, just like a <textarea>!',
        marks: [],
      },
    ],
  },
];

export const ReadOnly = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable readOnly placeholder="Enter some plain text..." />
    </Slate>
  );
};
