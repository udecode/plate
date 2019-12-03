import React, { useMemo } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { Editable, Slate } from 'slate-react-next';

const initialValue = [
  {
    children: [
      {
        text: '',
        marks: [],
      },
    ],
  },
];

export const PlainText = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable placeholder="Enter some plain text..." />
    </Slate>
  );
};
