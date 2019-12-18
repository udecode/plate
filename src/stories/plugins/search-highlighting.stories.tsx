import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  decorateSearchHighlight,
  EditablePlugins,
  ToolbarSearchHighlight,
  useCreateEditor,
} from 'slate-plugins';
import {
  HighlightPlugin,
  renderLeafHighlight,
} from 'slate-plugins/marks/highlight';
import { SearchHighlightPlugin } from 'slate-plugins/search-highlight/SearchHighlightPlugin';
import { Slate, withReact } from 'slate-react';
import { initialValueSearchHighlighting } from '../config/initialValues';

export default {
  title: 'Plugins/SearchHighlightPlugin',
  component: SearchHighlightPlugin,
  subcomponents: { HighlightPlugin },
};

export const SearchHighlighting = () => {
  const [search, setSearch] = useState('');

  const plugins = [];
  const renderLeaf = [];
  const decorate = [];
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin({ search }));
  if (boolean('renderLeafHighlight', false))
    renderLeaf.push(renderLeafHighlight());
  if (boolean('decorateHighlight', false))
    decorate.push(decorateSearchHighlight({ search }));

  const [value, setValue] = useState(initialValueSearchHighlighting);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <ToolbarSearchHighlight setSearch={setSearch} />
      <EditablePlugins
        plugins={plugins}
        renderLeaf={renderLeaf}
        decorate={decorate}
      />
    </Slate>
  );
};
