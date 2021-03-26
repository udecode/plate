import React from 'react';
import { Search } from '@styled-icons/material';
import {
  getBasicElementPlugins,
  getHistoryPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
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

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const { setSearch, plugin: searchHighlightPlugin } = useFindReplacePlugin();

  const plugins: SlatePlugin[] = [
    getReactPlugin(),
    getHistoryPlugin(),
    ...getBasicElementPlugins(),
    searchHighlightPlugin,
  ];

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
