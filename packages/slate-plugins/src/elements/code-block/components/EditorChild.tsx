import * as React from 'react';
import { useMemo, useState } from 'react';
import { EditablePlugins } from '@udecode/slate-plugins-core';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { pipe, SlateDocument } from '../../../common';
import { CodeBlockPlugin } from '../CodeBlockPlugin';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { EditorChildProps } from '../types';
import { withCodeBlock } from '../withCodeBlock';
import { CodeBlockElement } from './CodeBlockElement';
import { CodeLineElement } from './CodeLineElement';

// FIXME: why is it undefined?
console.log(DEFAULTS_CODE_BLOCK);

// FIXME: use parent options.
const options = {
  code_block: {
    component: CodeBlockElement,
    type: 'code_block',
    hotkey: ['mod+opt+8', 'mod+shift+8'],
    rootProps: {
      className: 'slate-code-block',
    },
  },
  code_line: {
    component: CodeLineElement,
    type: 'code_line',
    rootProps: {
      className: 'slate-code-line',
    },
  },
};

const plugins = [CodeBlockPlugin(options)];

// FIXME: pass options into withCodeBlock
const withPlugins = [withReact, withHistory, withCodeBlock(options)] as const;

export const EditorChild = ({ initialValue, onChange }: EditorChildProps) => {
  const [value, setValue] = useState<Node[]>(initialValue);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue as SlateDocument);
        onChange(newValue);
      }}
    >
      <EditablePlugins plugins={plugins} />
    </Slate>
  );
};
