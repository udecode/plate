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
  initialValueAutoformat,
  options,
  optionsExitBreak,
  optionsResetBlockTypes,
  optionsSoftBreak,
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
    withList({}, options),
    withCodeBlock({}, options),
    withAutoformat({
      rules: autoformatRules,
    }),
  ] as const;

  const plugins = [
    ParagraphPlugin(),
    BoldPlugin(),
    ItalicPlugin(),
    CodePlugin(),
    StrikethroughPlugin(),
    BlockquotePlugin(),
    ListPlugin(),
    HeadingPlugin(),
    CodeBlockPlugin(),
    ResetBlockTypePlugin(optionsResetBlockTypes),
    SoftBreakPlugin(optionsSoftBreak),
    ExitBreakPlugin(optionsExitBreak),
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
