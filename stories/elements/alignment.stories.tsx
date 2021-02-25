import React, { useMemo, useState } from 'react';
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
  HeadingToolbar,
  ParagraphPlugin,
  pipe,
  ResetBlockTypePlugin,
  SlateDocument,
  SlatePlugin,
  SoftBreakPlugin,
  ToolbarAlign,
  withCodeBlock,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  headingTypes,
  initialValueBasicElements,
  options,
  optionsResetBlockTypes,
} from '../config/initialValues';

export default {
  title: 'Elements/Alignment',
  subcomponents: {
    AlignPlugin,
    BlockquotePlugin,
    CodeBlockPlugin,
    HeadingPlugin,
    ParagraphPlugin,
  },
};

const withPlugins = [withReact, withHistory, withCodeBlock(options)] as const;

export const Example = () => {
  const plugins: SlatePlugin[] = [ResetBlockTypePlugin(optionsResetBlockTypes)];

  if (boolean('ParagraphPlugin', true)) plugins.push(ParagraphPlugin(options));
  if (boolean('AlignPlugin', true)) plugins.push(AlignPlugin(options));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(options));
  if (boolean('CodeBlockPlugin', true)) plugins.push(CodeBlockPlugin(options));
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
    const [value, setValue] = useState(initialValueBasicElements);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue as SlateDocument);
        }}
      >
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
