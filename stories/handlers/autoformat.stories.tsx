import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  BLOCKQUOTE,
  BlockquotePlugin,
  EditablePlugins,
  HeadingPlugin,
  ListPlugin,
  ParagraphPlugin,
  pipe,
  withAutoformat,
  withBreakEmptyReset,
  withDeleteStartReset,
  withList,
  withToggleType,
} from 'slate-plugins-next/src';
import { Slate, withReact } from 'slate-react';
import {
  initialValueMarkdownShortcuts,
  nodeTypes,
} from '../config/initialValues';

export default {
  title: 'Handlers/Autoformat',
  component: withAutoformat,
};

const resetOptions = {
  ...nodeTypes,
  types: [BLOCKQUOTE],
};

const withPlugins = [
  withReact,
  withHistory,
  withToggleType(nodeTypes),
  withAutoformat(nodeTypes),
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
