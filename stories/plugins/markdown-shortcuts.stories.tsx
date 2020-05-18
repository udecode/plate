import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  BLOCKQUOTE,
  BlockquotePlugin,
  EditablePlugins,
  HeadingPlugin,
  ListPlugin,
  ParagraphPlugin,
  pipe,
  withBlock,
  withBreakEmptyReset,
  withDeleteStartReset,
  withList,
  withShortcuts,
} from '../../packages/slate-plugins/src';
import {
  initialValueMarkdownShortcuts,
  nodeTypes,
} from '../config/initialValues';

export default {
  title: 'Plugins/Markdown Shortcuts',
};

const resetOptions = {
  ...nodeTypes,
  types: [BLOCKQUOTE],
};

const withPlugins = [
  withReact,
  withHistory,
  withBlock(nodeTypes),
  withShortcuts(nodeTypes),
  withDeleteStartReset(resetOptions),
  withBreakEmptyReset(resetOptions),
  withList(nodeTypes),
] as const;

export const Example = () => {
  const plugins = [
    ParagraphPlugin(nodeTypes),
    BlockquotePlugin(nodeTypes),
    ListPlugin(nodeTypes),
    HeadingPlugin(nodeTypes),
  ];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMarkdownShortcuts);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
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
