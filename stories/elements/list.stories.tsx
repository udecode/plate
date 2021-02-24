import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import { FormatListBulleted, FormatListNumbered } from '@styled-icons/material';
import {
  EditablePlugins,
  ExitBreakPlugin,
  HeadingPlugin,
  ImagePlugin,
  ListPlugin,
  ParagraphPlugin,
  ResetBlockTypePlugin,
  SlatePlugins,
  SoftBreakPlugin,
  TodoListPlugin,
  withImageUpload,
  withList,
} from '@udecode/slate-plugins';
import { HeadingToolbar, ToolbarList } from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import {
  headingTypes,
  initialValueList,
  options,
  optionsResetBlockTypes,
} from '../config/initialValues';

const id = 'Elements/List';

export default {
  title: id,
  component: ListPlugin,
  subcomponents: {
    TodoListPlugin,
  },
};

const withPlugins = [
  withReact,
  withHistory,
  withList(options),
  withImageUpload(options),
] as const;

export const Example = () => {
  const plugins: any[] = [
    ParagraphPlugin(options),
    HeadingPlugin(options),
    ImagePlugin(options),
    SoftBreakPlugin({
      rules: [
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [
              options.code_block.type,
              options.blockquote.type,
              options.td.type,
            ],
          },
        },
      ],
    }),
    ExitBreakPlugin({
      rules: [
        {
          hotkey: 'mod+enter',
        },
        {
          hotkey: 'mod+shift+enter',
          before: true,
        },
        {
          hotkey: 'enter',
          query: {
            start: true,
            end: true,
            allow: headingTypes,
          },
        },
      ],
    }),
  ];
  if (boolean('TodoListPlugin', true)) plugins.push(TodoListPlugin(options));
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin(options));
  if (boolean('ResetBlockTypePlugin', true))
    plugins.push(ResetBlockTypePlugin(optionsResetBlockTypes));

  const createReactEditor = () => () => {
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueList}
        withPlugins={withPlugins}
      >
        <HeadingToolbar>
          <ToolbarList
            {...options}
            typeList={options.ul.type}
            icon={<FormatListBulleted />}
          />
          <ToolbarList
            {...options}
            typeList={options.ol.type}
            icon={<FormatListNumbered />}
          />
        </HeadingToolbar>
        <EditablePlugins
          id={id}
          plugins={plugins}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
