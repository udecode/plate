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

export const Example = () => {
  const plugins = [
    BlockquotePlugin(nodeTypes),
    ListPlugin(nodeTypes),
    HeadingPlugin(nodeTypes),
    ParagraphPlugin(nodeTypes),
  ];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMarkdownShortcuts);

    const editor = useMemo(
      () =>
        withList(nodeTypes)(
          withBreakEmptyReset(resetOptions)(
            withDeleteStartReset(resetOptions)(
              withShortcuts(nodeTypes)(
                withBlock(nodeTypes)(withHistory(withReact(createEditor())))
              )
            )
          )
        ),
      []
    );

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
