import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { NodeEntry } from 'slate';
import { withHistory } from 'slate-history';
import {
  decorateHighlight,
  EditablePlugins,
  HighlightPlugin,
  renderLeafHighlight,
  ToolbarHighlight,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueSearchHighlighting } from '../config/initialValues';

export default {
  title: 'Plugins|SearchHighlightingPlugin',
};

export const SearchHighlighting = () => {
  const [search, setSearch] = useState<string>();

  const plugins = [];
  const renderLeaf = [];
  const decorate = [];
  if (boolean('HighlightPlugin', true)) plugins.push(HighlightPlugin());
  if (boolean('renderLeafHighlight', false))
    renderLeaf.push(renderLeafHighlight);
  if (boolean('decorateHighlight', false))
    decorate.push((entry: NodeEntry) => decorateHighlight(entry, search));

  const [value, setValue] = useState(initialValueSearchHighlighting);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <ToolbarHighlight setSearch={setSearch} />
      <EditablePlugins
        plugins={plugins}
        renderLeaf={renderLeaf}
        decorate={decorate}
      />
    </Slate>
  );
};
