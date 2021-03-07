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
  withCodeBlock,
  withList,
  withTrailingNode,
} from '@udecode/slate-plugins';
import {
  HeadingToolbar,
  ToolbarCodeBlock,
  ToolbarElement,
} from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import {
  headingTypes,
  initialValueSoftBreak,
  options,
  optionsResetBlockTypes,
} from '../config/initialValues';

const id = 'Handlers/Soft Break';

export default {
  title: id,
  component: SoftBreakPlugin,
};

const withPlugins = [
  withReact,
  withHistory,
  withList(options),
  withCodeBlock(options),
  withTrailingNode({ type: options.p.type }),
] as const;

export const BlockPlugins = () => {
  const plugins: SlatePlugin[] = [
    ParagraphPlugin(options),
    HeadingPlugin(options),
    CodeBlockPlugin(options),
    BlockquotePlugin(options),
    CodePlugin(options),
    ListPlugin(options),
    ResetBlockTypePlugin(optionsResetBlockTypes),
  ];
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
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueSoftBreak}
        withPlugins={withPlugins}
      >
        <HeadingToolbar>
          <ToolbarElement type={options.h1.type} icon={<LooksOne />} />
          <ToolbarElement type={options.h2.type} icon={<LooksTwo />} />
          <ToolbarElement
            type={options.blockquote.type}
            icon={<FormatQuote />}
          />
          <ToolbarCodeBlock
            type={options.code_block.type}
            icon={<CodeBlock />}
            options={options}
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
