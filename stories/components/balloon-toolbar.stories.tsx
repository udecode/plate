import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import React, { useMemo, useState } from 'react';
import { boolean, number, object, select } from '@storybook/addon-knobs';
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

  const arrow = boolean('arrow', false);
  const theme = select('theme', { dark: 'dark', light: 'light' }, 'dark');
  const direction = select(
    'direction',
    { top: 'top', bottom: 'bottom' },
    'top'
  );
  const hiddenDelay = number('hiddenDelay', 0);
  const tooltip = object('tooltip', {
    arrow: true,
    delay: 0,
    duration: [200, 0],
    hideOnClick: false,
    offset: [0, 17],
    placement: 'top',
  });

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <BalloonToolbar
        direction={direction}
        hiddenDelay={hiddenDelay}
        theme={theme}
        arrow={arrow}
      >
        <ToolbarMark
          reversed
          type={MARK_BOLD}
          icon={<FormatBold />}
          tooltip={{ content: 'Bold (⌘B)', ...tooltip }}
          theme={theme}
        />
        <ToolbarMark
          reversed
          type={MARK_ITALIC}
          icon={<FormatItalic />}
          tooltip={{ content: 'Italic (⌘I)', ...tooltip }}
          theme={theme}
        />
        <ToolbarMark
          reversed
          type={MARK_UNDERLINE}
          icon={<FormatUnderlined />}
          tooltip={{ content: 'Underline (⌘U)', ...tooltip }}
          theme={theme}
        />
      </BalloonToolbar>
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
