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
  ResetBlockTypePlugin,
  SlateDocument,
  SoftBreakPlugin,
  StrikethroughPlugin,
  withAutoformat,
  withCodeBlock,
  withList,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { autoformatRules } from '../config/autoformatRules';
import {
  headingTypes,
  initialValueAutoformat,
  options,
  optionsResetBlockTypes,
} from '../config/initialValues';

export default {
  title: 'Handlers/Autoformat',
  component: withAutoformat,
};

const withPlugins = [
  withReact,
  withHistory,
  withList(options),
  withCodeBlock(options),
  withAutoformat({
    rules: autoformatRules,
  }),
] as const;

export const Example = () => {
  const plugins = [
    ParagraphPlugin(options),
    BoldPlugin(),
    ItalicPlugin(),
    CodePlugin(),
    StrikethroughPlugin(),
    BlockquotePlugin(options),
    ListPlugin(options),
    HeadingPlugin(options),
    CodeBlockPlugin(options),
    ResetBlockTypePlugin(optionsResetBlockTypes),
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
