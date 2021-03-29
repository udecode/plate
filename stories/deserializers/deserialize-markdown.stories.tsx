import React from 'react';
import {
  createBasicElementPlugins,
  createBasicMarkPlugins,
  createDeserializeMDPlugin,
  createHistoryPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  createTablePlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValuePasteMd } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Deserializers/Markdown';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  ...createBasicMarkPlugins(),
  createImagePlugin(),
  createLinkPlugin(),
  createListPlugin(),
  createTablePlugin(),
  createDeserializeMDPlugin(),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValuePasteMd}
  />
);
