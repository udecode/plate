import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import { FormatQuote, LooksOne, LooksTwo } from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
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
  TablePlugin,
  ToolbarElement,
  withList,
  withResetBlockType,
  withToggleType,
  withTrailingNode,
  withTransforms,
} from '../../packages/slate-plugins/src';
import {
  headingTypes,
  initialValueExitBreak,
  nodeTypes,
} from '../config/initialValues';

export default {
  title: 'Handlers/Exit Break',
  component: ExitBreakPlugin,
};

const withPlugins = [
  withReact,
  withHistory,
  withToggleType({ defaultType: nodeTypes.typeP }),
  withResetBlockType({
    types: [
      nodeTypes.typeActionItem,
      nodeTypes.typeBlockquote,
      nodeTypes.typeCodeBlock,
    ],
    defaultType: nodeTypes.typeP,
  }),
  withList(nodeTypes),
  withTransforms(),
  withTrailingNode({ type: nodeTypes.typeP }),
] as const;

export const Example = () => {
  const plugins: SlatePlugin[] = [
    ParagraphPlugin(nodeTypes),
    HeadingPlugin(nodeTypes),
    CodeBlockPlugin(nodeTypes),
    BlockquotePlugin(nodeTypes),
    CodePlugin(nodeTypes),
    ListPlugin(nodeTypes),
    TablePlugin(nodeTypes),
  ];
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
    const [value, setValue] = useState(initialValueExitBreak);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
      >
        <HeadingToolbar>
          <ToolbarElement type={nodeTypes.typeH1} icon={<LooksOne />} />
          <ToolbarElement type={nodeTypes.typeH2} icon={<LooksTwo />} />
          <ToolbarElement
            type={nodeTypes.typeBlockquote}
            icon={<FormatQuote />}
          />
          <ToolbarElement type={nodeTypes.typeCodeBlock} icon={<CodeBlock />} />
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
