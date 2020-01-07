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
  ListType,
  ParagraphPlugin,
  withBlock,
  withBreakEmptyReset,
  withDeleteStartReset,
  withShortcuts,
} from '../../packages/slate-plugins/src';
import { initialValueMarkdownShortcuts } from '../config/initialValues';

export default {
  title: 'Plugins/Markdown Shortcuts',
};

const resetOptions = {
  types: [BLOCKQUOTE, ListType.LIST_ITEM],
  unwrapTypes: [ListType.UL_LIST, ListType.OL_LIST],
};

export const Example = () => {
  const plugins = [
    BlockquotePlugin(),
    ListPlugin(),
    HeadingPlugin(),
    ParagraphPlugin(),
  ];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMarkdownShortcuts);

    const editor = useMemo(
      () =>
        withBreakEmptyReset(resetOptions)(
          withDeleteStartReset(resetOptions)(
            withShortcuts(
              withBlock({
                unwrapTypes: resetOptions.unwrapTypes,
              })(withHistory(withReact(createEditor())))
            )
          )
        ),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
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
