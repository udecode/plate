import React, { useMemo, useState } from 'react';
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
  HeadingToolbar,
  ListPlugin,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  SlatePlugin,
  SoftBreakPlugin,
  ToolbarElement,
  withList,
  withResetBlockType,
  withToggleType,
  withTrailingNode,
  withTransforms,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  headingTypes,
  initialValueSoftBreak,
  options,
} from '../config/initialValues';

export default {
  title: 'Handlers/Soft Break',
  component: SoftBreakPlugin,
};

const withPlugins = [
  withReact,
  withHistory,
  withToggleType({ defaultType: options.p.type }),
  withResetBlockType({
    types: [
      options.todo_li.type,
      options.blockquote.type,
      options.code_block.type,
    ],
    defaultType: options.p.type,
  }),
  withList(options),
  withTransforms(),
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
    const [value, setValue] = useState(initialValueSoftBreak);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
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
