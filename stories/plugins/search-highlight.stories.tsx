import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Search } from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  decorateSearchHighlight,
  EditablePlugins,
  HighlightPlugin,
  ParagraphPlugin,
  renderLeafHighlight,
  SearchHighlightPlugin,
  ToolbarSearchHighlight,
} from '../../packages/slate-plugins/src';
import {
  initialValueSearchHighlighting,
  nodeTypes,
} from '../config/initialValues';

export default {
  title: 'Plugins/Search Highlight',
  component: SearchHighlightPlugin,
  subcomponents: {
    HighlightPlugin,
    renderLeafHighlight,
    decorateSearchHighlight,
  },
};

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];
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
        onChange={(newValue) => setValue(newValue)}
      >
        <ToolbarSearchHighlight icon={Search} setSearch={setSearch} />
        <EditablePlugins plugins={plugins} decorate={decorate} />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
