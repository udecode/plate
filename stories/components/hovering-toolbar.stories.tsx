import React, { useMemo, useState } from 'react';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
} from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  BoldPlugin,
  EditablePlugins,
  HoveringToolbar,
  ItalicPlugin,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  pipe,
  ToolbarMark,
  UnderlinePlugin,
} from '../../packages/slate-plugins/src';
import {
  initialValueHoveringToolbar,
  nodeTypes,
} from '../config/initialValues';

export default {
  title: 'Components/Hovering Toolbar',
};

const plugins = [
  BoldPlugin(nodeTypes),
  ItalicPlugin(nodeTypes),
  UnderlinePlugin(nodeTypes),
];

const withPlugins = [withReact, withHistory] as const;

export const Example = () => {
  const [value, setValue] = useState(initialValueHoveringToolbar);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <HoveringToolbar>
        <ToolbarMark reversed type={MARK_BOLD} icon={<FormatBold />} />
        <ToolbarMark reversed type={MARK_ITALIC} icon={<FormatItalic />} />
        <ToolbarMark
          reversed
          type={MARK_UNDERLINE}
          icon={<FormatUnderlined />}
        />
      </HoveringToolbar>
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
