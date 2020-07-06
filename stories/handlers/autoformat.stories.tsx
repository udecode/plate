import React, { useMemo, useState } from 'react';
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
  pipe,
  SlateDocument,
  SoftBreakPlugin,
  StrikethroughPlugin,
  withAutoformat,
  withList,
  withResetBlockType,
  withToggleType,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { autoformatRules } from '../config/autoformatRules';
import {
  headingTypes,
  initialValueAutoformat,
  nodeTypes,
} from '../config/initialValues';

export default {
  title: 'Handlers/Autoformat',
  component: withAutoformat,
};

const withPlugins = [
  withReact,
  withHistory,
  withToggleType({ defaultType: nodeTypes.typeP }),
  withAutoformat({
    rules: autoformatRules,
  }),
  withResetBlockType({
    types: [
      nodeTypes.typeActionItem,
      nodeTypes.typeBlockquote,
      nodeTypes.typeCodeBlock,
    ],
    defaultType: nodeTypes.typeP,
  }),
  withList(nodeTypes),
] as const;

export const Example = () => {
  const plugins = [
    ParagraphPlugin(nodeTypes),
    BoldPlugin(),
    ItalicPlugin(),
    CodePlugin(),
    StrikethroughPlugin(),
    BlockquotePlugin(nodeTypes),
    ListPlugin(nodeTypes),
    HeadingPlugin(nodeTypes),
    CodeBlockPlugin(nodeTypes),
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

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueAutoformat);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder="Write some markdown..."
          spellCheck
          autoFocus
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
