import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  BlockquotePlugin,
  EditablePlugins,
  HeadingPlugin,
  ListPlugin,
  MarkdownShortcutsPlugin,
  renderElementShortcuts,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueMarkdownShortcuts } from '../config/initialValues';

export default {
  title: 'Plugins|MarkdownShortcutsPlugin',
};

export const MarkdownShortcuts = () => {
  const plugins = [BlockquotePlugin(), ListPlugin(), HeadingPlugin()];
  const renderElement = [];
  if (boolean('MarkdownShortcutsPlugin', true, 'plugins'))
    plugins.push(MarkdownShortcutsPlugin());
  else if (boolean('renderElementShortcuts', false, 'renderElement'))
    renderElement.push(renderElementShortcuts);

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
        renderElement={renderElement}
        placeholder="Write some markdown..."
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
