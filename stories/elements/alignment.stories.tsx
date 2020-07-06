import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import {
  FormatAlignCenter,
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
  SlateDocument,
  SlatePlugin,
  SoftBreakPlugin,
  ToolbarAlign,
  withResetBlockType,
  withToggleType,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  headingTypes,
  initialValueBasicElements,
  nodeTypes,
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

const withPlugins = [
  withReact,
  withHistory,
  withToggleType({ defaultType: nodeTypes.typeP }),
  withResetBlockType({
    types: [nodeTypes.typeBlockquote, nodeTypes.typeCodeBlock],
    defaultType: nodeTypes.typeP,
  }),
] as const;

export const Example = () => {
  const plugins: SlatePlugin[] = [];
  if (boolean('ParagraphPlugin', true))
    plugins.push(ParagraphPlugin(nodeTypes));
  if (boolean('AlignPlugin', true)) plugins.push(AlignPlugin(nodeTypes));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(nodeTypes));
  if (boolean('CodePlugin', true)) plugins.push(CodeBlockPlugin(nodeTypes));
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin(nodeTypes));
  if (boolean('SoftBreakPlugin', true))
    plugins.push(
      SoftBreakPlugin({
        rules: [
          { hotkey: 'shift+enter' },
          {
            hotkey: 'enter',
            query: {
              allow: [nodeTypes.typeCodeBlock, nodeTypes.typeBlockquote],
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
            type={nodeTypes.typeAlignCenter}
            icon={<FormatAlignCenter />}
          />
          <ToolbarAlign
            type={nodeTypes.typeAlignRight}
            icon={<FormatAlignRight />}
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
