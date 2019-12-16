import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  BlockquotePlugin,
  EditablePlugins,
  HeadingPlugin,
  ListPlugin,
  MarkdownShortcutsPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueMarkdownShortcuts } from '../config/initialValues';

export default {
  title: 'Plugins|MarkdownShortcutsPlugin',
};

export const MarkdownShortcuts = () => {
  const plugins = [BlockquotePlugin(), ListPlugin(), HeadingPlugin()];
  if (boolean('MarkdownShortcutsPlugin', true))
    plugins.push(MarkdownShortcutsPlugin());

  const [value, setValue] = useState(initialValueMarkdownShortcuts);

  const editor = useCreateEditor([withReact, withHistory], plugins);

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
