import React, { useMemo } from 'react';
import { Search } from '@styled-icons/material';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  SlatePlugin,
  SlatePlugins,
  ToolbarSearchHighlight,
  useFindReplacePlugin,
} from '@udecode/slate-plugins';
import { initialValueSearchHighlighting } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Widgets/Search Highlight';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();

export const Example = () => {
  const { setSearch, plugin: searchHighlightPlugin } = useFindReplacePlugin();

  const plugins: SlatePlugin[] = useMemo(
    () => [
      createReactPlugin(),
      createHistoryPlugin(),
      ...createBasicElementPlugins(),
      searchHighlightPlugin,
    ],
    [searchHighlightPlugin]
  );

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueSearchHighlighting}
    >
      <ToolbarSearchHighlight icon={Search} setSearch={setSearch} />
    </SlatePlugins>
  );
};
