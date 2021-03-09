import React from 'react';
import {
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  EditablePlugins,
  ExitBreakPlugin,
  HeadingPlugin,
  ItalicPlugin,
  ListPlugin,
  ParagraphPlugin,
  ResetBlockTypePlugin,
  SlatePlugins,
  SoftBreakPlugin,
  StrikethroughPlugin,
  withAutoformat,
  withCodeBlock,
  withList,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { autoformatRules } from '../config/autoformatRules';
import {
  headingTypes,
  initialValueAutoformat,
  options,
  optionsResetBlockTypes,
} from '../config/initialValues';

const id = 'Handlers/Autoformat';

export default {
  title: id,
  component: withAutoformat,
};

export const Example = () => {
  const withPlugins = [
    withReact,
    withHistory,
    withList(options),
    withCodeBlock(options),
    withAutoformat({
      rules: autoformatRules,
    }),
  ] as const;

  const plugins = [
    ParagraphPlugin(options),
    BoldPlugin(),
    ItalicPlugin(),
    CodePlugin(),
    StrikethroughPlugin(),
    BlockquotePlugin(options),
    ListPlugin(options),
    HeadingPlugin(options),
    CodeBlockPlugin(options),
    ResetBlockTypePlugin(optionsResetBlockTypes),
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

  return (
    <SlatePlugins
      id={id}
      initialValue={initialValueAutoformat}
      withPlugins={withPlugins}
    >
      <EditablePlugins
        plugins={plugins}
        editableProps={{
          placeholder: 'Write some markdown...',
          spellCheck: true,
          autoFocus: true,
        }}
      />
    </SlatePlugins>
  );
};
