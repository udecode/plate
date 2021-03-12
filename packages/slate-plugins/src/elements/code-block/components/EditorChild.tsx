import * as React from 'react';
import { useMemo, useState } from 'react';
import { EditablePlugins } from '@udecode/slate-plugins-core';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { pipe, SlateDocument } from '../../../common';
import { CodeBlockPlugin } from '../CodeBlockPlugin';
import { EditorChildProps } from '../types';

const plugins = [CodeBlockPlugin];

const withPlugins = [withReact, withHistory] as const;

export const EditorChild = ({ initialValue }: EditorChildProps) => {
  const [value, setValue] = useState(initialValue);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value!}
      onChange={(newValue) => setValue(newValue as SlateDocument)}
    >
      <EditablePlugins plugins={plugins} autoFocus />
    </Slate>
  );
};
