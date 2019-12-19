import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  BlockquotePlugin,
  EditablePlugins,
  HeadingPlugin,
  ListPlugin,
  withList,
  withShortcuts,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueMarkdownShortcuts } from '../config/initialValues';

export default {
  title: 'Plugins/withShortcuts',
};

export const MarkdownShortcuts = () => {
  const plugins = [BlockquotePlugin(), ListPlugin(), HeadingPlugin()];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMarkdownShortcuts);

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const editor = useCreateEditor(
      [withShortcuts, withList, withReact, withHistory],
      plugins
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
