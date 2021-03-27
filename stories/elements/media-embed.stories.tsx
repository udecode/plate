import React from 'react';
import {
  ELEMENT_IMAGE,
  getBasicElementPlugins,
  getHistoryPlugin,
  getMediaEmbedPlugin,
  getReactPlugin,
  getSelectOnBackspacePlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueEmbeds } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Elements/Media Embed';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();
const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  getMediaEmbedPlugin(),
  getSelectOnBackspacePlugin({ allow: [options[ELEMENT_IMAGE].type] }),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueEmbeds}
  />
);
