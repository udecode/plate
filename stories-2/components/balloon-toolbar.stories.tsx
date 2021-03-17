import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import React from 'react';
import { boolean, number, object, select } from '@storybook/addon-knobs';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
} from '@styled-icons/material';
import { TippyProps } from '@tippyjs/react';
import {
  BoldPlugin,
  EditablePlugins,
  ItalicPlugin,
  ListPlugin,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  SlatePlugins,
  UnderlinePlugin,
  withList,
} from '@udecode/slate-plugins';
import { BalloonToolbar, ToolbarMark } from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValueBalloonToolbar, options } from '../config/initialValues';

const id = 'Components/Balloon Toolbar';

export default {
  title: id,
  component: BalloonToolbar,
};

const plugins = [
  BoldPlugin(options),
  ItalicPlugin(options),
  UnderlinePlugin(options),
  ListPlugin(options),
];

const withOverrides = [withReact, withHistory, withList(options)] as const;

export const Example = () => {
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

  return (
    <SlatePlugins
      id={id}
      initialValue={initialValueBalloonToolbar}
      withOverrides={withOverrides}
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
      <EditablePlugins
        plugins={plugins}
        editableProps={{
          placeholder: 'Enter some text...',
        }}
      />
    </SlatePlugins>
  );
};
