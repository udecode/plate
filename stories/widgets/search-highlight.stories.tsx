import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Search } from '@styled-icons/material';
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
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  initialValueSearchHighlighting,
  options,
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
  const plugins: any[] = [ParagraphPlugin(options)];
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin(options));

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
