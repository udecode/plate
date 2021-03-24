import React from 'react';
import {
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useBasicMarkPlugins,
  useDeserializeMDPlugin,
  useHistoryPlugin,
  useImagePlugin,
  useLinkPlugin,
  useListPlugin,
  useReactPlugin,
  useTablePlugin,
} from '@udecode/slate-plugins';
import { initialValuePasteMd } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Deserializers/Markdown';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    ...useBasicMarkPlugins(),
    useImagePlugin(),
    useLinkPlugin(),
    useListPlugin(),
    useTablePlugin(),
    useDeserializeMDPlugin(),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValuePasteMd}
    />
  );
};
