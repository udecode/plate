import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import {
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight,
} from '@styled-icons/material';
import {
  AlignPlugin,
  BlockquotePlugin,
  CodeBlockPlugin,
  EditablePlugins,
  ExitBreakPlugin,
  HeadingPlugin,
  ParagraphPlugin,
  ResetBlockTypePlugin,
  SlatePlugin,
  SlatePlugins,
  SoftBreakPlugin,
} from '@udecode/slate-plugins';
import {
  HeadingToolbar,
  ToolbarAlign,
} from '@udecode/slate-plugins-components';
import {
  headingTypes,
  initialValueBasicElements,
  options,
  optionsResetBlockTypes,
} from '../config/initialValues';

const id = 'Elements/Alignment';

export default {
  title: id,
  subcomponents: {
    AlignPlugin,
    BlockquotePlugin,
    CodeBlockPlugin,
    HeadingPlugin,
    ParagraphPlugin,
  },
};

export const Example = () => {
  const plugins: SlatePlugin[] = [ResetBlockTypePlugin(optionsResetBlockTypes)];

  if (boolean('ParagraphPlugin', true)) plugins.push(ParagraphPlugin(options));
  if (boolean('AlignPlugin', true)) plugins.push(AlignPlugin(options));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(options));
  if (boolean('CodePlugin', true)) plugins.push(CodeBlockPlugin(options));
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin(options));
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
      <SlatePlugins id={id} initialValue={initialValueBasicElements}>
        <HeadingToolbar>
          <ToolbarAlign icon={<FormatAlignLeft />} />
          <ToolbarAlign
            type={options.align_center.type}
            icon={<FormatAlignCenter />}
          />
          <ToolbarAlign
            type={options.align_right.type}
            icon={<FormatAlignRight />}
          />
          <ToolbarAlign
            type={options.align_justify.type}
            icon={<FormatAlignJustify />}
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
