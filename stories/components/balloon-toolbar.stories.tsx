import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import React, { useMemo, useState } from 'react';
import { boolean, number, object, select } from '@storybook/addon-knobs';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
} from '@styled-icons/material';
import { TippyProps } from '@tippyjs/react';
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
  SlateDocument,
  ToolbarMark,
  UnderlinePlugin,
  withList,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueBalloonToolbar, options } from '../config/initialValues';

export default {
  title: 'Components/Balloon Toolbar',
  component: BalloonToolbar,
};

const plugins = [
  BoldPlugin(options),
  ItalicPlugin(options),
  UnderlinePlugin(options),
  ListPlugin(options),
];

const withPlugins = [withReact, withHistory, withList(options)] as const;

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
  const tooltip: TippyProps = object('tooltip', {
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
      onChange={(newValue) => setValue(newValue as SlateDocument)}
    >
      <BalloonToolbar
        direction={direction}
        hiddenDelay={hiddenDelay}
        theme={theme}
        arrow={arrow}
      >
        <ToolbarMark
          type={MARK_BOLD}
          icon={<FormatBold />}
          tooltip={{ content: 'Bold (⌘B)', ...tooltip }}
        />
        <ToolbarMark
          type={MARK_ITALIC}
          icon={<FormatItalic />}
          tooltip={{ content: 'Italic (⌘I)', ...tooltip }}
        />
        <ToolbarMark
          type={MARK_UNDERLINE}
          icon={<FormatUnderlined />}
          tooltip={{ content: 'Underline (⌘U)', ...tooltip }}
        />
      </BalloonToolbar>
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
