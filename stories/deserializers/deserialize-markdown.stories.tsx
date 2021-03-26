import React from 'react';
import {
  getBasicElementPlugins,
  getBasicMarkPlugins,
  getDeserializeMDPlugin,
  getHistoryPlugin,
  getImagePlugin,
  getLinkPlugin,
  getListPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  getTablePlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValuePasteMd } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Deserializers/Markdown';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  ...getBasicMarkPlugins(),
  getImagePlugin(),
  getLinkPlugin(),
  getListPlugin(),
  getTablePlugin(),
  getDeserializeMDPlugin(),
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
