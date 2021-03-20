import React from 'react';
import { Search } from '@styled-icons/material';
import {
  getSlatePluginsOptions,
  SlatePlugin,
  SlatePlugins,
  useBasicElementPlugins,
  useHistoryPlugin,
  useReactPlugin,
  useSearchHighlightPlugin,
} from '@udecode/slate-plugins';
import {
  getSlatePluginsComponents,
  ToolbarSearchHighlight,
} from '@udecode/slate-plugins-components';
import { initialValueSearchHighlighting } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Widgets/Search Highlight';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const { setSearch, ...searchHighlightPlugin } = useSearchHighlightPlugin();

  const plugins: SlatePlugin[] = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
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
