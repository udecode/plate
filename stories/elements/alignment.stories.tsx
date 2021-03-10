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
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import {
  initialValueBasicElements,
  options,
  optionsExitBreak,
  optionsResetBlockTypes,
  optionsSoftBreak,
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

  if (boolean('ParagraphPlugin', true)) plugins.push(ParagraphPlugin());
  if (boolean('AlignPlugin', true)) plugins.push(AlignPlugin());
  if (boolean('BlockquotePlugin', true)) plugins.push(BlockquotePlugin());
  if (boolean('CodeBlockPlugin', true)) plugins.push(CodeBlockPlugin());
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin());
  if (boolean('SoftBreakPlugin', true))
    plugins.push(SoftBreakPlugin(optionsSoftBreak));
  if (boolean('ExitBreakPlugin', true))
    plugins.push(ExitBreakPlugin(optionsExitBreak));

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
          plugins={plugins}
          editableProps={{
            placeholder: 'Enter some rich text…',
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
