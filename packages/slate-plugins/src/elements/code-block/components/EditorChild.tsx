import * as React from 'react';
import { useMemo, useState } from 'react';
import { EditablePlugins } from '@udecode/slate-plugins-core';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { pipe, SlateDocument } from '../../../common';
import { CodeBlockPlugin } from '../CodeBlockPlugin';
import { EditorChildProps } from '../types';
import { withCodeBlock } from '../withCodeBlock';

const plugins = [CodeBlockPlugin];

// FIXME: pass options into withCodeBlock
const withPlugins = [withReact, withHistory, withCodeBlock()] as const;

export const EditorChild = ({ initialValue, onChange }: EditorChildProps) => {
  const [value, setValue] = useState(initialValue);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value!}
      onChange={(newValue) => {
        setValue(newValue as SlateDocument);
        onChange?.(newValue);
      }}
    >
      <EditablePlugins plugins={plugins} autoFocus />
    </Slate>
  );
};
