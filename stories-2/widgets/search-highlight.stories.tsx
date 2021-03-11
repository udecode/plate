import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Search } from '@styled-icons/material';
import {
  EditablePlugins,
  ParagraphPlugin,
  SearchHighlightPlugin,
  SlatePlugins,
  useDecorateSearchHighlight,
} from '@udecode/slate-plugins';
import { ToolbarSearchHighlight } from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValueSearchHighlighting } from '../config/initialValues';

const id = 'Widgets/Search Highlight';

export default {
  title: id,
  component: SearchHighlightPlugin,
};

const withPlugins = [withReact, withHistory] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin()];
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin());

  const createReactEditor = () => () => {
    const decorate = [];

    const [search, setSearch] = useState('');

    if (boolean('decorateSearchHighlight', true)) {
      decorate.push(useDecorateSearchHighlight({ search }));
    }

    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueSearchHighlighting}
        withPlugins={withPlugins}
      >
        <ToolbarSearchHighlight icon={Search} setSearch={setSearch} />
        <EditablePlugins
          plugins={plugins}
          decorate={decorate}
          decorateDeps={[search]}
          renderLeafDeps={[search]}
          editableProps={{
            placeholder: 'Enter some text...',
            spellCheck: true,
            autoFocus: true,
          }}
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
