import React, { useMemo, useState } from 'react';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
} from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  BalloonToolbar,
  BoldPlugin,
  EditablePlugins,
  ItalicPlugin,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  pipe,
  ToolbarMark,
  UnderlinePlugin,
} from 'slate-plugins-next/src';
import { Slate, withReact } from 'slate-react';
import { initialValueBalloonToolbar, nodeTypes } from '../config/initialValues';

export default {
  title: 'Components/Balloon Toolbar',
};

const plugins = [
  BoldPlugin(nodeTypes),
  ItalicPlugin(nodeTypes),
  UnderlinePlugin(nodeTypes),
];

const withPlugins = [withReact, withHistory] as const;

export const Example = () => {
  const [value, setValue] = useState(initialValueBalloonToolbar);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <BalloonToolbar>
        <ToolbarMark reversed type={MARK_BOLD} icon={<FormatBold />} />
        <ToolbarMark reversed type={MARK_ITALIC} icon={<FormatItalic />} />
        <ToolbarMark
          reversed
          type={MARK_UNDERLINE}
          icon={<FormatUnderlined />}
        />
      </BalloonToolbar>
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
