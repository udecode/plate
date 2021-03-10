import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import { FormatQuote, LooksOne, LooksTwo } from '@styled-icons/material';
import {
  BlockquotePlugin,
  CodeBlockPlugin,
  CodePlugin,
  EditablePlugins,
  ExitBreakPlugin,
  HeadingPlugin,
  ListPlugin,
  ParagraphPlugin,
  ResetBlockTypePlugin,
  SlatePlugin,
  SlatePlugins,
  SoftBreakPlugin,
  TablePlugin,
  withCodeBlock,
  withList,
  withTrailingNode,
} from '@udecode/slate-plugins';
import {
  HeadingToolbar,
  ToolbarElement,
} from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import {
  initialValueExitBreak,
  options,
  optionsExitBreak,
  optionsResetBlockTypes,
  optionsSoftBreak,
} from '../config/initialValues';

const id = 'Handlers/Exit Break';

export default {
  title: id,
  component: ExitBreakPlugin,
};

const withPlugins = [
  withReact,
  withHistory,
  withList({}, options),
  withCodeBlock({}, options),
  withTrailingNode({ type: options.p.type }),
] as const;

export const Example = () => {
  const plugins: SlatePlugin[] = [
    ParagraphPlugin(),
    HeadingPlugin(),
    CodeBlockPlugin(),
    BlockquotePlugin(),
    CodePlugin(),
    ListPlugin(),
    TablePlugin(),
    ResetBlockTypePlugin(optionsResetBlockTypes),
  ];
  if (boolean('SoftBreakPlugin', true))
    plugins.push(SoftBreakPlugin(optionsSoftBreak));
  if (boolean('ExitBreakPlugin', true))
    plugins.push(ExitBreakPlugin(optionsExitBreak));

  const createReactEditor = () => () => {
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueExitBreak}
        withPlugins={withPlugins}
      >
        <HeadingToolbar>
          <ToolbarElement type={options.h1.type} icon={<LooksOne />} />
          <ToolbarElement type={options.h2.type} icon={<LooksTwo />} />
          <ToolbarElement
            type={options.blockquote.type}
            icon={<FormatQuote />}
          />
          <ToolbarElement type={options.code_block.type} icon={<CodeBlock />} />
        </HeadingToolbar>
        <EditablePlugins
          plugins={plugins}
          editableProps={{
            placeholder: 'Enter some rich text...',
            spellCheck: true,
            autoFocus: true,
          }}
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
