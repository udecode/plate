import 'prismjs/themes/prism.css';
import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import {
  FormatQuote, 
} from '@styled-icons/material';
import {
  BlockquotePlugin,
  BoldPlugin,
  EditablePlugins,
  ExitBreakPlugin,
  HeadingToolbar,
  ItalicPlugin,
  ListPlugin,
  ParagraphPlugin,
  pipe,
  ResetBlockTypePlugin,
  SlatePlugin,
  SoftBreakPlugin,
  TodoListPlugin,
  ToolbarElement,
  ToolbarList,
  withAutoformat,
  withList,
  withMarks,
} from '@udecode/slate-plugins';
import { createEditor ,Node} from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  headingTypes,
  initialValueList,
  initialValueBlockquote,
  options,
  optionsResetBlockTypes,
} from '../config/initialValues';
import { autoformatRules } from '../config/autoformatRules';
import { FormatListBulleted, FormatListNumbered } from 'styled-icons/material';

export default {
  title: 'Elements/Lazy - BlockquotePlugin enriched',
  subcomponents: {
    BlockquotePlugin,
    ParagraphPlugin,
  },
};

const withPlugins = [
  withReact,
  withHistory,
  withList(options),
  withMarks(),
  withAutoformat({ rules: autoformatRules }),
  ] as const;

const initialValue: Node[] = [  
  ...initialValueBlockquote, 
  ...initialValueList, 
];

export const Example = () => {
  const plugins: SlatePlugin[] = [];
  if (boolean('ParagraphPlugin', true)) plugins.push(ParagraphPlugin(options));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(options));  
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin(options));
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin(options));
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin(options));
  if (boolean('TodoListPlugin', true)) plugins.push(TodoListPlugin(options));
  if (boolean('ResetBlockTypePlugin', true))
    plugins.push(ResetBlockTypePlugin(optionsResetBlockTypes));
  if (boolean('SoftBreakPlugin', true))
    plugins.push(
      SoftBreakPlugin({
        rules: [
          { hotkey: 'shift+enter' },
          {
            hotkey: 'enter',
            query: {
              allow: [options.code_block.type, options.blockquote.type],
            },
          },
        ],
      })
    );
  if (boolean('ExitBreakPlugin', true))
    plugins.push(
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
      })
    );

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValue);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
        }}
      >
        <HeadingToolbar>
          <ToolbarElement
            type={options.blockquote.type}
            icon={<FormatQuote />}
          />
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
