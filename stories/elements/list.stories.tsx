import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { FormatListBulleted, FormatListNumbered } from '@styled-icons/material';
import {
  EditablePlugins,
  ExitBreakPlugin,
  HeadingPlugin,
  HeadingToolbar,
  ImagePlugin,
  ListPlugin,
  ParagraphPlugin,
  pipe,
  ResetBlockTypePlugin,
  SlateDocument,
  SoftBreakPlugin,
  TodoListPlugin,
  ToolbarList,
  withImageUpload,
  withList,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  headingTypes,
  initialValueList,
  options,
  optionsResetBlockTypes,
} from '../config/initialValues';

export default {
  title: 'Elements/List',
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
    const [value, setValue] = useState(initialValueList);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
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
          plugins={plugins}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
