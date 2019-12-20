import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  decorateSearchHighlight,
  EditablePlugins,
  ToolbarSearchHighlight,
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
  subcomponents: {
    HighlightPlugin,
    renderLeafHighlight,
    decorateSearchHighlight,
  },
};

export const SearchHighlighting = () => {
  const plugins: any[] = [];
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin());

  const createReactEditor = () => () => {
    const decorate = [];

    const [search, setSearch] = useState('');

    if (boolean('decorateHighlight', true))
      decorate.push(decorateSearchHighlight({ search }));

    const [value, setValue] = useState(initialValueSearchHighlighting);

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <ToolbarSearchHighlight setSearch={setSearch} />
        <EditablePlugins plugins={plugins} decorate={decorate} />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
