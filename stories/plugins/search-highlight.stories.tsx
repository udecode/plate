import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Search } from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  decorateSearchHighlight,
  EditablePlugins,
  HighlightPlugin,
  ParagraphPlugin,
  pipe,
  renderLeafHighlight,
  SearchHighlightPlugin,
  ToolbarSearchHighlight,
} from 'slate-plugins-next/src';
import { Slate, withReact } from 'slate-react';
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

const withPlugins = [withReact, withHistory] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin(nodeTypes));

  const createReactEditor = () => () => {
    const decorate = [];

    const [search, setSearch] = useState('');

    if (boolean('decorateHighlight', true)) {
      decorate.push(decorateSearchHighlight({ search }));
    }

    const [value, setValue] = useState(initialValueSearchHighlighting);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <ToolbarSearchHighlight icon={Search} setSearch={setSearch} />
        <EditablePlugins
          plugins={plugins}
          decorate={decorate}
          decorateDeps={[search]}
          renderLeafDeps={[search]}
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
