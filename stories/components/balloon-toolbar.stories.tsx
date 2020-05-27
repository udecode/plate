import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import React, { useMemo, useState } from 'react';
import { number, object, select } from '@storybook/addon-knobs';
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
  ListPlugin,
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
  component: BalloonToolbar,
};

const plugins = [
  BoldPlugin(nodeTypes),
  ItalicPlugin(nodeTypes),
  UnderlinePlugin(nodeTypes),
  ListPlugin(nodeTypes),
];

const withPlugins = [withReact, withHistory] as const;

export const Example = () => {
  const [value, setValue] = useState(initialValueBalloonToolbar);

  const direction = select(
    'direction',
    { top: 'top', bottom: 'bottom' },
    'top'
  );
  const hiddenDelay = number('hiddenDelay', 0);
  const tooltip = object('tooltip', {
    arrow: true,
    offset: [0, 10],
    delay: 0,
    duration: [200, 0],
    hideOnClick: false,
  });

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <BalloonToolbar direction={direction} hiddenDelay={hiddenDelay}>
        <ToolbarMark
          reversed
          type={MARK_BOLD}
          icon={<FormatBold />}
          tooltip={{ content: 'Bold (⌘B)', ...tooltip }}
        />
        <ToolbarMark
          reversed
          type={MARK_ITALIC}
          icon={<FormatItalic />}
          tooltip={{ content: 'Italic (⌘I)', ...tooltip }}
        />
        <ToolbarMark
          reversed
          type={MARK_UNDERLINE}
          icon={<FormatUnderlined />}
          tooltip={{ content: 'Underline (⌘U)', ...tooltip }}
        />
      </BalloonToolbar>
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
