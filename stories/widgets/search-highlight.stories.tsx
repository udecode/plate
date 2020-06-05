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
  pipe,
  renderLeafHighlight,
  SearchHighlightPlugin,
  SlateDocument,
  ToolbarSearchHighlight,
} from '../../packages/slate-plugins/src';
import {
  initialValueSearchHighlighting,
  nodeTypes,
} from '../config/initialValues';

export default {
  title: 'Widgets/Search Highlight',
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

    if (boolean('decorateSearchHighlight', true)) {
      decorate.push(decorateSearchHighlight({ search }));
    }

    const [value, setValue] = useState(initialValueSearchHighlighting);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
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
